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
    PREVIEW_SET_CURRENT_ROUTE,
    PREVIEW_START_DRAG_NEW_COMPONENT,
    PREVIEW_START_DRAG_EXISTING_COMPONENT,
    PREVIEW_DROP_COMPONENT,
    PREVIEW_DRAG_OVER_COMPONENT,
    PREVIEW_DRAG_OVER_PLACEHOLDER
} from '../actions/preview';

import {
    STRUCTURE_SELECT_ROUTE
} from '../actions/structure';

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
    getRouteByComponentId,
    getComponentById
} from '../models/Project';

import { Record, Set } from 'immutable';

import { concatPath } from '../utils';
import { getComponentMeta } from '../utils/meta';

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
    currentRouteIsIndexRoute: false,
    currentRouteId: -1,
    draggingComponent: false,
    draggedComponentId: -1,
    draggedComponents: null,
    draggingOverComponentId: -1,
    draggingOverPlaceholder: false,
    placeholderContainerId: -1,
    placeholderAfter: -1,

    selectedRouteId: -1,
    indexRouteSelected: false,

    selectingComponentLayout: false
});

const addComponents = (state, routeId, isIndexRoute, parentComponentId, position, components) => {
    const nextComponentId = state.lastComponentId + 1;

    state = state.updateIn(
        ['data', 'routes', routeId, 'components'],

        routeComponents => routeComponents.withMutations(routeComponentsMut =>
            void components.forEach(newComponent =>
                void routeComponentsMut.set(
                    newComponent.id + nextComponentId,

                    newComponent
                        .merge({
                            id: newComponent.id + nextComponentId,
                            isNew: false,
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
    const route = getRouteByComponentId(state.data, componentId),
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

const moveComponent = (state, componentId, targetComponentId, position) => {
    const route = getRouteByComponentId(state.data, componentId),
        component = route.components.get(componentId);

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
        ids => ids.filter(id => id !== componentId)
    );

    const targetChildrenListPath = [
        'data',
        'routes',
        route.id,
        'components',
        targetComponentId,
        'children'
    ];

    return state.updateIn(
        targetChildrenListPath,
        ids => ids.insert(position, componentId)
    );
};

const initDNDState = state => state.merge({
    draggingComponent: false,
    draggedComponents: null,
    draggingOverComponentId: -1,
    draggingOverPlaceholder: false,
    placeholderContainerId: -1,
    placeholderAfter: -1,
    highlightingEnabled: true
});

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
                    lastComponentId,
                    selectedRouteId: project.rootRoutes.size > 0
                        ? project.rootRoutes.get(0)
                        : -1,

                    indexRouteSelected: false
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

            const parentRoute = action.parentRouteId > -1
                ? state.data.routes.get(action.parentRouteId)
                : null;

            const fullPath = parentRoute
                ? concatPath(parentRoute.fullPath, action.path)
                : action.path;

            const newRoute = new ProjectRoute({
                id: newRouteId,
                parentId: action.parentRouteId,
                path: action.path,
                fullPath,
                title: action.title
            });

            state = state.setIn(['data', 'routes', newRouteId], newRoute);

            const pathToIdsList = action.parentRouteId === -1
                ? ['data', 'rootRoutes']
                : ['data', 'routes', action.parentRouteId, 'children'];


            state = state.updateIn(pathToIdsList, list => list.push(newRouteId));

            return state.set('lastRouteId', newRouteId);
        }

        case PROJECT_ROUTE_DELETE: {
            const deletedRoute = state.data.routes.get(action.routeId),
                deletedRouteIds = gatherRoutesTreeIds(state.data, action.routeId);

            // De-select and de-highlight all componenets
            state = state.merge({
                selectedItems: Set(),
                highlightedItems: Set()
            });

            // Delete routes
            state = state.updateIn(
                ['data', 'routes'],
                routes => routes.filter(route => !deletedRouteIds.has(route.id))
            );

            // Update rootRoutes or parent's children list
            const pathToIdsList = deletedRoute.parentId === -1
                ? ['data', 'rootRoutes']
                : ['data', 'routes', deletedRoute.parentId, 'children'];

            state = state.updateIn(
                pathToIdsList,
                routeIds => routeIds.filter(routeId => routeId !== action.routeId)
            );

            // Update selected route
            const deletedRouteIsSelected =
                state.selectedRouteId > -1 &&
                deletedRouteIds.has(state.selectedRouteId);

            if (deletedRouteIsSelected) {
                state = state.merge({
                    selectedRouteId: state.data.routes.size > 0
                        ? state.data.routes.get(0)
                        : -1,

                    indexRouteSelected: false
                });
            }

            return state;
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
            return moveComponent(
                state,
                action.componentId,
                action.targetComponentId,
                action.position
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

            if (state.draggedComponentId === action.componentId)
                state = initDNDState(state);

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

        case PREVIEW_SET_CURRENT_ROUTE: {
            return state.merge({
                currentRouteId: action.routeId,
                currentRouteIsIndexRoute: action.isIndexRoute
            });
        }

        case PREVIEW_START_DRAG_NEW_COMPONENT: {
            return state.merge({
                draggingComponent: true,
                draggedComponentId: -1,
                draggedComponents: action.components,
                highlightingEnabled: false,
                highlightedItems: Set()
            });
        }

        case PREVIEW_START_DRAG_EXISTING_COMPONENT: {
            const route = getRouteByComponentId(state.data, action.componentId);

            return state.merge({
                draggingComponent: true,
                draggedComponentId: action.componentId,
                draggedComponents: route.components,
                highlightingEnabled: false,
                highlightedItems: Set()
            });
        }

        case PREVIEW_DROP_COMPONENT: {
            if (!state.draggingComponent) return state;
            if (!state.draggingOverPlaceholder) return initDNDState(state);

            let willDrop = false;

            if (state.placeholderContainerId === -1) {
                willDrop = true;
            }
            else {
                const container = getComponentById(
                    state.data,
                    state.placeholderContainerId
                );

                willDrop =
                    container.routeId === state.currentRouteId &&
                    container.isIndexRoute === state.currentRouteIsIndexRoute
            }

            if (!willDrop) return initDNDState(state);

            if (state.draggedComponentId > -1) {
                // We're dragging an existing component
                state = moveComponent(
                    state,
                    state.draggedComponentId,
                    state.placeholderContainerId,
                    state.placeholderAfter + 1
                );

                return initDNDState(state);
            }
            else {
                // We're dragging a new component from palette
                const rootComponent = state.draggedComponents.get(0);

                const componentMeta = getComponentMeta(
                    rootComponent.name,
                    state.meta
                );

                const isCompositeComponentWithMultipleLayouts =
                    componentMeta.kind === 'composite' &&
                    componentMeta.layouts.length > 1;

                if (isCompositeComponentWithMultipleLayouts) {
                    return state.merge({
                        selectingComponentLayout: true,
                        draggingComponent: false
                    });
                }
                else {
                    if (state.placeholderContainerId === -1) {
                        // Creating root component for current route
                        state = addComponents(
                            state,
                            state.currentRouteId,
                            state.currentRouteIsIndexRoute,
                            -1,
                            0,
                            state.draggedComponents
                        );
                    }
                    else {
                        // Creating nested component
                        state = addComponents(
                            state,
                            state.currentRouteId,
                            state.currentRouteIsIndexRoute,
                            state.placeholderContainerId,
                            state.placeholderAfter + 1,
                            state.draggedComponents
                        );
                    }

                    return initDNDState(state);
                }
            }
        }

        case PREVIEW_DRAG_OVER_COMPONENT: {
            return state.merge({
                draggingOverComponentId: action.componentId,
                draggingOverPlaceholder: false,
                placeholderContainerId: -1,
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

        case STRUCTURE_SELECT_ROUTE: {
            return state.merge({
                selectedRouteId: action.routeId,
                indexRouteSelected: action.indexRouteSelected
            });
        }

        default:
            return state;
    }
};
