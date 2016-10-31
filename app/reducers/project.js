/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import {
    NOT_LOADED,
    LOADING,
    LOADED,
    LOAD_ERROR
} from '../constants/loadStates';

import {
    PROJECT_REQUEST,
    PROJECT_LOADED,
    PROJECT_LOAD_FAILED,
    PROJECT_ROUTE_CREATE,
    PROJECT_ROUTE_DELETE,
    PROJECT_ROUTE_UPDATE_FIELD,
    PROJECT_COMPONENT_CREATE,
    PROJECT_COMPONENT_DELETE,
    PROJECT_COMPONENT_MOVE,
    PROJECT_COMPONENT_CREATE_ROOT,
    PROJECT_COMPONENT_UPDATE_PROP_VALUE,
    PROJECT_COMPONENT_RENAME,
    PROJECT_COMPONENT_TOGGLE_REGION
} from '../actions/project';

import {
    PREVIEW_SELECT_COMPONENT,
    PREVIEW_DESELECT_COMPONENT,
    PREVIEW_TOGGLE_COMPONENT_SELECTION,
    PREVIEW_HIGHLIGHT_COMPONENT,
    PREVIEW_UNHIGHLIGHT_COMPONENT,
    PREVIEW_TOGGLE_HIGHLIGHTING,
    PREVIEW_SET_BOUNDARY_COMPONENT,
    PREVIEW_SET_IS_INDEX_ROUTE,
    PREVIEW_START_DRAG_COMPONENT,
    PREVIEW_STOP_DRAG_COMPONENT,
    PREVIEW_DRAG_OVER_COMPONENT,
    PREVIEW_DRAG_OVER_PLACEHOLDER
} from '../actions/preview';

import ProjectRoute from '../models/ProjectRoute';
import ProjectComponentProp from '../models/ProjectComponentProp';
import SourceDataStatic from '../models/SourceDataStatic';
import SourceDataData from '../models/SourceDataData';
import SourceDataConst from '../models/SourceDataConst';
import SourceDataAction from '../models/SourceDataAction';
import SourceDataDesigner from '../models/SourceDataDesigner';

import {
    projectToImmutable,
    getMaxRouteId,
    getMaxComponentId,
    gatherRoutesTreeIds,
    gatherComponentsTreeIds,
    getRouteByComponentId
} from '../models/Project';

import { Record, Set } from 'immutable';

const propSourceDataToImmutable = {
    static: input => new SourceDataStatic(input),
    data: input => new SourceDataData(input),
    const: input => new SourceDataConst(input),
    action: input => new SourceDataAction(input),
    designer: input => new SourceDataDesigner(input)
};

const ProjectState = Record({
    projectName: '',
    loadState: NOT_LOADED,
    data: null,
    meta: null,
    error: null,
    lastRouteId: -1,
    lastComponentId: -1,

    selectedItems: Set(),
    highlightedItems: Set(),
    highlightingEnabled: true,
    boundaryComponentId: null,
    currentRouteIsIndexRoute: false,
    draggingComponent: false,
    draggedComponent: null,
    draggingOverComponentId: null,
    draggingOverPlaceholder: false,
    placeholderContainerId: null,
    placeholderAfter: -1
});

const addComponents = (state, routeId, isIndexRoute, parentComponentId, position, components) => {
    const nextComponentId = state.get('lastComponentId') + 1;

    state = state.updateIn(
        ['data', 'routes', routeId, 'components'],

        components => components.withMutations(componentsMut =>
            void components.forEach(newComponent =>
                void componentsMut.set(
                    newComponent.id + nextComponentId,

                    newComponent
                        .merge({
                            id: newComponent.id + nextComponentId,
                            parentId: newComponent.parentId === -1
                                ? parentComponentId
                                : newComponent.parentId + nextComponentId,

                            routeId: routeId,
                            isIndexRoute: isIndexRoute
                        })
                        .update(
                            'children',
                            childIds => childIds.map(id => id + nextComponentId)
                        )
                )
            )
        )
    );

    if (parentComponentId !== -1) {
        const pathToChildrenIdsList = [
            'data',
            'routes',
            routeId,
            'components',
            parentComponentId,
            'children'
        ];

        state = state.updateIn(
            pathToChildrenIdsList,
            childComponentIds => childComponentIds.insert(position, nextComponentId)
        )
    }
    else {
        state = state.setIn(
            ['data', 'routes', routeId, isIndexRoute ? 'indexComponent' : 'component'],
            nextComponentId
        );
    }

    return state.update(
        'lastComponentId',
        lastComponentId => lastComponentId + components.size
    );
};

const deleteComponent = (state, componentId) => {
    const route = getRouteByComponentId(componentId),
        component = route.components.get(componentId),
        idsToDelete = gatherComponentsTreeIds(route, componentId);

    state = state.updateIn(
        ['data', 'routes', route.id, 'components'],

        components => components.withMutations(mut =>
            void idsToDelete.forEach(id => void mut.delete(id)))
    );

    if (component.parentId === -1) {
        if (route.component === componentId)
            state = state.setIn(['data', 'routes', route.id, 'component'], -1);

        if (route.indexComponent === componentId)
            state = state.setIn(['data', 'routes', route.id, 'indexComponent'], -1);
    }
    else {
        state = state.updateIn(
            ['data', 'routes', route.id, 'components', component.parentId, 'children'],
            children => children.filter(id => id !== componentId)
        );
    }

    return state;
};

export default (state = new ProjectState(), action) => {
    switch (action.type) {
        case PROJECT_REQUEST: {
            return state.merge({
                projectName: action.projectName,
                loadState: LOADING
            });
        }

        case PROJECT_LOADED: {
            const project = projectToImmutable(action.project),
                lastRouteId = getMaxRouteId(project),
                lastComponentId = getMaxComponentId(project);

            return state
                .merge({
                    projectName: action.project.name,
                    loadState: LOADED,
                    data: project,
                    error: null,
                    lastRouteId,
                    lastComponentId
                })
                .set('meta', action.metadata); // Prevent conversion to Immutable.Map
        }

        case PROJECT_LOAD_FAILED: {
            return state.merge({
                loadState: LOAD_ERROR,
                data: null,
                meta: null,
                error: action.error,
                lastRouteId: -1,
                lastComponentId: -1
            });
        }

        case PROJECT_ROUTE_CREATE: {
            const newRouteId = state.lastRouteId + 1;

            const newRoute = new ProjectRoute({
                id: state.lastRouteId,
                parentId: action.parentRouteId,
                path: action.path,
                title: action.title
            });

            state = state.setIn(['data', 'routes', newRouteId], newRoute);

            const pathToIdsList = action.parentRouteId === -1
                ? ['data', 'rootRoutes']
                : ['data', 'routes', action.parentRouteId, 'children'];


            state = state.updateIn(pathToIdsList, list => list.push(newRouteId));

            return state.update('lastRouteId', newRouteId);
        }

        case PROJECT_ROUTE_DELETE: {
            const deletedRoute = state.getIn(['data', 'routes', action.routeId]),
                deletedRouteIds = gatherRoutesTreeIds(state.data, action.routeId);

            state = state.updateIn(
                ['data', 'routes'],
                routes => routes.filter(route => !deletedRouteIds.has(route.id))
            );

            const pathToIdsList = deletedRoute.parentId === -1
                ? ['data', 'rootRoutes']
                : ['data', 'routes', deletedRoute.parentId, 'children'];

            return state.updateIn(
                pathToIdsList,
                rootRoutes => rootRoutes.filter(route => route.id !== deletedRoute.id)
            );
        }

        case PROJECT_ROUTE_UPDATE_FIELD: {
            return state.setIn(
                ['data', 'routes', action.routeId, action.field],
                action.newValue
            );
        }

        case PROJECT_COMPONENT_CREATE_ROOT: {
            const route = state.getIn(['data', 'routes', action.routeId]);

            const alreadyHaveComponent = action.isIndexRoute
                ? route.indexComponent !== -1
                : route.component !== -1;

            if (alreadyHaveComponent) {
                throw new Error(
                    `Route ${action.routeId} already has ` +
                    `${action.isIndexRoute ? 'index' : 'root'} component`
                );
            }

            return addComponents(
                state,
                action.routeId,
                action.isIndexRoute,
                -1,
                0,
                action.components
            );
        }

        case PROJECT_COMPONENT_CREATE: {
            const route = getRouteByComponentId(state.data, action.parentComponentId),
                parentComponent = route.components.get(action.parentComponentId);

            return addComponents(
                state,
                route.id,
                parentComponent.isIndexRoute,
                parentComponent.id,
                action.position,
                action.components
            );
        }

        case PROJECT_COMPONENT_MOVE: {
            const route = getRouteByComponentId(state.data, action.componentId),
                component = route.components.get(action.componentId);

            if (component.parentId === -1)
                throw new Error('Cannot move root component');

            const sourceChildrenListPath = [
                'data',
                'routes',
                route.id,
                'components',
                component.parentId,
                'children'
            ];

            state = state.updateIn(
                sourceChildrenListPath,
                ids => ids.filter(id => id !== action.componentId)
            );

            const targetChildrenListPath = [
                'data',
                'routes',
                route.id,
                'components',
                action.targetComponentId,
                'children'
            ];

            return state.updateIn(
                targetChildrenListPath,
                ids => ids.insert(action.position, action.componentId)
            );
        }

        case PROJECT_COMPONENT_DELETE: {
            state = state.update(
                'selectedItems',
                selectedItems => selectedItems.delete(action.componentId)
            );

            state = state.update(
                'highlightedItems',
                highlightedItems => highlightedItems.delete(action.componentId)
            );

            if (state.boundaryComponentId === action.componentId)
                state = state.set('boundaryComponentId', null);

            return deleteComponent(state, action.componentId);
        }

        case PROJECT_COMPONENT_UPDATE_PROP_VALUE: {
            const route = getRouteByComponentId(state.data, action.componentId),
                convertSourceData = propSourceDataToImmutable[action.newSource];

            const newValue = new ProjectComponentProp({
                source: action.newSource,
                sourceData: convertSourceData(action.newSourceData)
            });

            const path = [
                'data',
                'routes',
                route.id,
                'components',
                action.componentId,
                'props',
                action.propName
            ];

            return state.setIn(path, newValue);
        }

        case PROJECT_COMPONENT_RENAME: {
            const route = getRouteByComponentId(state.data, action.componentId);

            const path = [
                'data',
                'routes',
                route.id,
                'components',
                action.componentId,
                'title'
            ];

            return state.setIn(path, action.newTitle);
        }

        case PROJECT_COMPONENT_TOGGLE_REGION: {
            const route = getRouteByComponentId(state.data, action.componentId);

            const path = [
                'data',
                'routes',
                route.id,
                'components',
                action.componentId,
                'regionsEnabled'
            ];

            return state.updateIn(path, regionsEnabled => action.enable
                ? regionsEnabled.add(action.regionIdx)
                : regionsEnabled.delete(action.regionIdx)
            );
        }

        case PREVIEW_HIGHLIGHT_COMPONENT: {
            return state.update('highlightedItems', set => set.add(action.componentId));
        }

        case PREVIEW_UNHIGHLIGHT_COMPONENT: {
            return state.update('highlightedItems', set => set.delete(action.componentId));
        }

        case PREVIEW_TOGGLE_HIGHLIGHTING: {
            if (state.highlightingEnabled === action.enable) {
                return state;
            }
            else {
                return state.merge({
                    highlightingEnabled: action.enable,
                    highlightedItems: Set()
                });
            }
        }

        case PREVIEW_SELECT_COMPONENT: {
            if (action.exclusive) {
                return state.set('selectedItems', Set([action.componentId]));
            }
            else {
                return state.update('selectedItems', set => set.add(action.componentId));
            }
        }

        case PREVIEW_DESELECT_COMPONENT: {
            return state.update('selectedItems', set => set.delete(action.componentId));
        }

        case PREVIEW_TOGGLE_COMPONENT_SELECTION: {
            const updater = state.selectedItems.has(action.componentId)
                ? set => set.delete(action.componentId)
                : set => set.add(action.componentId);

            return state.update('selectedItems', updater);
        }

        case PREVIEW_SET_BOUNDARY_COMPONENT: {
            return state.set('boundaryComponentId', action.componentId);
        }

        case PREVIEW_SET_IS_INDEX_ROUTE: {
            return state.set('currentRouteIsIndexRoute', action.value);
        }

        case PREVIEW_START_DRAG_COMPONENT: {
            return state.merge({
                draggingComponent: true,
                draggedComponent: action.component
            });
        }

        case PREVIEW_STOP_DRAG_COMPONENT: {
            return state.merge({
                draggingComponent: false,
                draggedComponent: null,
                draggingOverComponentId: null
            });
        }

        case PREVIEW_DRAG_OVER_COMPONENT: {
            return state.merge({
                draggingOverComponentId: action.componentId,
                draggingOverPlaceholder: false,
                placeholderContainerId: null,
                placeholderAfter: -1
            });
        }

        case PREVIEW_DRAG_OVER_PLACEHOLDER: {
            return state.merge({
                draggingOverPlaceholder: true,
                placeholderContainerId: action.containerId,
                placeholderAfter: action.afterIdx
            });
        }

        default:
            return state;
    }
};
