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
    PROJECT_ROUTE_CREATE,
    PROJECT_ROUTE_DELETE,
    PROJECT_ROUTE_UPDATE_FIELD,
    PROJECT_COMPONENT_DELETE,
    PROJECT_COMPONENT_UPDATE_PROP_VALUE,
	PROJECT_COMPONENT_UPDATE_QUERY_ARGS,
    PROJECT_COMPONENT_ADD_PROP_VALUE,
    PROJECT_COMPONENT_DELETE_PROP_VALUE,
    PROJECT_COMPONENT_RENAME,
    PROJECT_COMPONENT_TOGGLE_REGION,
    PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT,
    PROJECT_CONSTRUCT_COMPONENT_FOR_PROP,
    PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP,
    PROJECT_SAVE_COMPONENT_FOR_PROP,
    PROJECT_LINK_PROP,
    PROJECT_LINK_WITH_OWNER_PROP,
    PROJECT_LINK_PROP_CANCEL,
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
    APP_LOCALIZATION_LOAD_SUCCESS
} from '../actions/app';

import {
    STRUCTURE_SELECT_ROUTE
} from '../actions/structure';

import {
    LIBRARY_SHOW_ALL_COMPONENTS
} from '../actions/components-library';

import ProjectRoute from '../models/ProjectRoute';
import ProjectComponentProp from '../models/ProjectComponentProp';
import SourceDataStatic from '../models/SourceDataStatic';
import SourceDataDesigner from '../models/SourceDataDesigner';

import {
    projectToImmutable,
    getMaxRouteId,
    getMaxComponentId,
    gatherRoutesTreeIds
} from '../models/Project';

import {
    sourceDataToImmutable,
    gatherComponentsTreeIds,
    isRootComponent,
    getValueByPath,
    QueryArgumentValue
} from '../models/ProjectComponent';

import { Record, Map, Set, List } from 'immutable';

import { concatPath } from '../utils';

import {
    getComponentMeta,
    constructComponent,
    parseComponentName,
    formatComponentName,
    getNestedTypedef
} from '../utils/meta';

import {
    parseGraphQLSchema
} from '../utils/schema';

import { NO_VALUE } from '../constants/misc';

import _mapValues from 'lodash.mapvalues';

export const NestedConstructor = Record({
    components: Map(),
    rootId: -1,
    componentId: -1,
    prop: '',
    path: [],
    lastComponentId: -1,
    selectedComponentIds: Set(),
    highlightedComponentIds: Set()
});

const ProjectState = Record({
    projectName: '',
    loadState: NOT_LOADED,
    data: null,
	schema: null,
    meta: null,
    error: null,
    lastRouteId: -1,
    lastComponentId: -1,

    selectedItems: Set(),
    highlightedItems: Set(),
    highlightingEnabled: true,
    showAllComponentsOnPalette: false,
    currentRouteId: -1,
    currentRouteIsIndexRoute: false,
    draggingComponent: false,
    draggedComponentId: -1,
    draggedComponents: null,
    draggingOverComponentId: -1,
    draggingOverPlaceholder: false,
    placeholderContainerId: -1,
    placeholderAfter: -1,

    selectedRouteId: -1,
    indexRouteSelected: false,

    languageForComponentProps: 'en',
    selectingComponentLayout: false,

    nestedConstructors: List(),
    linkingProp: false,
    linkingPropOfComponentId: -1,
    linkingPropName: '',
    linkingPropPath: []
});

const haveNestedConstructors = state => !state.nestedConstructors.isEmpty();

const getTopNestedConstructor = state => state.nestedConstructors.first() || null;

const openNestedConstructor = (state, nestedConstructor) => state.update(
    'nestedConstructors',
    nestedConstructors => nestedConstructors.unshift(nestedConstructor)
);

const closeAllNestedConstructors = state => state.set('nestedConstructors', List());

const closeTopNestedConstructor = state => state.update(
    'nestedConstructors',
    nestedConstructors => nestedConstructors.shift()
);

const getPathToCurrentComponents = state => haveNestedConstructors(state)
    ? ['nestedConstructors', 0, 'components']
    : ['data', 'routes', state.currentRouteId, 'components'];

const getPathToCurrentLastComponentId = state => haveNestedConstructors(state)
    ? ['nestedConstructors', 0, 'lastComponentId']
    : ['lastComponentId'];

const getPathToCurrentRootComponentId = state => haveNestedConstructors(state)
    ? ['nestedConstructors', 0, 'rootId']

    : [
        'data',
        'routes',
        state.currentRouteId,
        state.currentRouteIsIndexRoute ? 'indexComponent' : 'component'
    ];

const getPathToCurrentSelectedComponentIds = state => haveNestedConstructors(state)
    ? ['nestedConstructors', 0, 'selectedComponentIds']
    : ['selectedItems'];

const getPathToCurrentHighlightedComponentIds = state => haveNestedConstructors(state)
    ? ['nestedConstructors', 0, 'highlightedComponentIds']
    : ['highlightedItems'];

const selectComponent = (state, componentId) => state.updateIn(
    getPathToCurrentSelectedComponentIds(state),
    selectedComponentIds => selectedComponentIds.add(componentId)
);

const selectComponentExclusive = (state, componentId) =>
    state.setIn(getPathToCurrentSelectedComponentIds(state), Set([componentId]));

const toggleComponentSelection = (state, componentId) => {
    const pathToCurrentSelectedComponentIds = getPathToCurrentSelectedComponentIds(state),
        currentSelectedComponentIds = state.getIn(pathToCurrentSelectedComponentIds);

    const updater = currentSelectedComponentIds.has(componentId)
        ? selectedComponentIds => selectedComponentIds.delete(componentId)
        : selectedComponentIds => selectedComponentIds.add(componentId);

    return state.updateIn(pathToCurrentSelectedComponentIds, updater);
};

const deselectComponent = (state, componentId) => state.updateIn(
    getPathToCurrentSelectedComponentIds(state),
    selectedComponentIds => selectedComponentIds.delete(componentId)
);

const highlightComponent = (state, componentId) => state.updateIn(
    getPathToCurrentHighlightedComponentIds(state),
    highlightedComponentIds => highlightedComponentIds.add(componentId)
);

const unhighlightComponent = (state, componentId) => state.updateIn(
    getPathToCurrentHighlightedComponentIds(state),
    highlightedComponentIds => highlightedComponentIds.delete(componentId)
);

const addComponents = (state, parentComponentId, position, components) => {
    const pathToCurrentLastComponentId = getPathToCurrentLastComponentId(state),
        lastComponentId = state.getIn(pathToCurrentLastComponentId),
        nextComponentId = lastComponentId + 1,
        pathToCurrentComponents = getPathToCurrentComponents(state);

    state = state.updateIn(
        pathToCurrentComponents,

        updatedComponents => updatedComponents.withMutations(updatedComponentsMut =>
            void components.forEach(newComponent =>
                void updatedComponentsMut.set(
                    newComponent.id + nextComponentId,

                    newComponent
                        .merge({
                            id: newComponent.id + nextComponentId,
                            isNew: false,
                            parentId: newComponent.parentId === -1
                                ? parentComponentId
                                : newComponent.parentId + nextComponentId,

                            routeId: state.currentRouteId,
                            isIndexRoute: state.currentRouteIsIndexRoute
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
        const pathToChildrenIdsList = [].concat(pathToCurrentComponents, [
            parentComponentId,
            'children'
        ]);

        state = state.updateIn(
            pathToChildrenIdsList,
            childComponentIds => childComponentIds.insert(position, nextComponentId)
        )
    }
    else {
        state = state.setIn(getPathToCurrentRootComponentId(state), nextComponentId);
    }

    return state.updateIn(
        pathToCurrentLastComponentId,
        lastComponentId => lastComponentId + components.size
    );
};

const deleteComponent = (state, componentId) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state),
        currentComponents = state.getIn(pathToCurrentComponents);

    if (!currentComponents.has(componentId)) {
        throw new Error(
            'An attempt was made to delete a component ' +
            'that is not in current editing area'
        );
    }

    const component = currentComponents.get(componentId),
        idsToDelete = gatherComponentsTreeIds(currentComponents, componentId);

    state = state.updateIn(
        pathToCurrentComponents,

        components => components.withMutations(componentsMut =>
            void idsToDelete.forEach(id => void componentsMut.delete(id)))
    );

    if (isRootComponent(component)) {
        state = state.setIn(getPathToCurrentRootComponentId(state), -1);
    }
    else {
        const pathToChildrenIdsList = [].concat(pathToCurrentComponents, [
            component.parentId,
            'children'
        ]);

        state = state.updateIn(
            pathToChildrenIdsList,
            children => children.filter(id => id !== componentId)
        );
    }

    return state;
};

const moveComponent = (state, componentId, targetComponentId, position) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state),
        currentComponents = state.getIn(pathToCurrentComponents);

    if (!currentComponents.has(componentId)) {
        throw new Error(
            'An attempt was made to move a component ' +
            'that is not in current editing area'
        );
    }

    if (!currentComponents.has(targetComponentId)) {
        throw new Error(
            'An attempt was made to move a component ' +
            'outside current editing area'
        );
    }

    const component = currentComponents.get(componentId);

    if (component.parentId === -1)
        throw new Error('Cannot move root component');

    if (component.parentId === targetComponentId) {
        const childrenPath = [].concat(pathToCurrentComponents, [
            component.parentId,
            'children'
        ]);

        return state.updateIn(childrenPath, ids => {
            const idx = ids.indexOf(componentId);

            return idx === position
                ? ids
                : ids.delete(idx).insert(position - (idx < position), componentId);
        });
    }

    const sourceChildrenListPath = [].concat(pathToCurrentComponents, [
        component.parentId,
        'children'
    ]);

    state = state.updateIn(
        sourceChildrenListPath,
        ids => ids.filter(id => id !== componentId)
    );

    const targetChildrenListPath = [].concat(pathToCurrentComponents, [
        targetComponentId,
        'children'
    ]);

    state = state.updateIn(
        targetChildrenListPath,
        ids => ids.insert(position, componentId)
    );

    const pathToParentId = [].concat(pathToCurrentComponents, [componentId, 'parentId']);
    return state.setIn(pathToParentId, targetComponentId);
};

const initDNDState = state => state.merge({
    draggingComponent: false,
    draggedComponents: null,
    draggedComponentId: -1,
    draggingOverComponentId: -1,
    draggingOverPlaceholder: false,
    placeholderContainerId: -1,
    placeholderAfter: -1,
    highlightingEnabled: true
});

const insertDraggedComponents = (state, components) => {
    if (state.placeholderContainerId === -1) {
        // Creating root component
        return addComponents(state, -1, 0, components);
    }
    else {
        // Creating nested component
        return addComponents(
            state,
            state.placeholderContainerId,
            state.placeholderAfter + 1,
            components
        );
    }
};

const selectFirstRoute = state => state.merge({
    selectedRouteId: state.data.routes.size > 0
        ? state.data.routes.get(0)
        : -1,

    indexRouteSelected: false
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
                lastComponentId = getMaxComponentId(project),
				schema = action.schema ? parseGraphQLSchema(action.schema) : null;

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
                .set('schema', schema)
                .set('meta', action.metadata); // Prevent conversion to Immutable.Map
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

            // De-select and de-highlight all components
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

            if (deletedRouteIsSelected) state = selectFirstRoute(state);

            return state;
        }

        case PROJECT_ROUTE_UPDATE_FIELD: {
            return state.setIn(
                ['data', 'routes', action.routeId, action.field],
                action.newValue
            );
        }

        case PROJECT_COMPONENT_DELETE: {
            state = deselectComponent(state, action.componentId);
            state = unhighlightComponent(state, action.componentId);

            if (state.draggedComponentId === action.componentId)
                state = initDNDState(state);

            return deleteComponent(state, action.componentId);
        }

		case PROJECT_COMPONENT_UPDATE_QUERY_ARGS: {
			const pathToCurrentComponents = getPathToCurrentComponents(state),
                currentComponents = state.getIn(pathToCurrentComponents);

			if (!currentComponents.has(action.componentId)) {
                throw new Error(
                    'An attempt was made to update a component ' +
                    'that is not in current editing area'
                );
            }

			const pathToComponent = [].concat(pathToCurrentComponents, [
                action.componentId
			]);

			if (action.newQueryArgs) {
                const pathToQueryArgs = pathToComponent.concat('queryArgs');

                const toMerge = _mapValues(
                    action.newQueryArgs,

                    argsByContext => _mapValues(
                        argsByContext,

                        argsByPath => _mapValues(
                            argsByPath,

                            arg => new QueryArgumentValue({
                                source: arg.source,
                                sourceData: sourceDataToImmutable(
                                    arg.source,
                                    arg.sourceData
                                )
                            })
                        )
                    )
                );
				return state.mergeIn(pathToQueryArgs, toMerge);
			}

			return state;
		}

        case PROJECT_COMPONENT_UPDATE_PROP_VALUE: {
            const pathToCurrentComponents = getPathToCurrentComponents(state),
                currentComponents = state.getIn(pathToCurrentComponents);

            if (!currentComponents.has(action.componentId)) {
                throw new Error(
                    'An attempt was made to update a component ' +
                    'that is not in current editing area'
                );
            }

            const newPropValue = new ProjectComponentProp({
                source: action.newSource,
                sourceData: sourceDataToImmutable(
                    action.newSource,
                    action.newSourceData
                )
            });

			const pathToComponent = [].concat(pathToCurrentComponents, [
                action.componentId
			]);

			if (action.newQueryArgs) {
                const pathToQueryArgs = pathToComponent.concat('queryArgs');

                const toMerge = _mapValues(
                    action.newQueryArgs,

                    argsByContext => _mapValues(
                        argsByContext,

                        argsByPath => _mapValues(
                            argsByPath,

                            arg => new QueryArgumentValue({
                                source: arg.source,
                                sourceData: sourceDataToImmutable(
                                    arg.source,
                                    arg.sourceData
                                )
                            })
                        )
                    )
                );

                state = state.mergeIn(pathToQueryArgs, toMerge);
            }

            const pathToProp = pathToComponent.concat([
                'props',
                action.propName
            ], ...action.path.map(index => ['sourceData', 'value', index]));

            return state.setIn(pathToProp, newPropValue);
        }

        case PROJECT_COMPONENT_ADD_PROP_VALUE: {
            const pathToCurrentComponents = getPathToCurrentComponents(state),
                currentComponents = state.getIn(pathToCurrentComponents);

            if (!currentComponents.has(action.componentId)) {
                throw new Error(
                    'An attempt was made to update a component ' +
                    'that is not in current editing area'
                );
            }

            const newValue = new ProjectComponentProp({
                source: action.source,
                sourceData: sourceDataToImmutable(
                    action.source,
                    action.sourceData
                )
            });

            const path = [].concat(pathToCurrentComponents, [
                action.componentId,
                'props',
                action.propName
            ], ...action.path.map(index => ['sourceData', 'value', index]),
                'sourceData',
                'value'
            );

            return state.updateIn(path, mapOrList => {
                if (List.isList(mapOrList)) {
                    if (typeof action.index !== 'number')
                        throw new Error('');

                    return action.index > -1
                        ? mapOrList.insert(action.index, newValue)
                        : mapOrList.push(newValue);
                }
                else if (Map.isMap(mapOrList)) {
                    if (typeof action.index !== 'string' || !action.index)
                        throw new Error('');

                    return mapOrList.set(action.index, newValue);
                }
                else {
                    throw new Error('');
                }
            });
        }

        case PROJECT_COMPONENT_DELETE_PROP_VALUE: {
            const pathToCurrentComponents = getPathToCurrentComponents(state),
                currentComponents = state.getIn(pathToCurrentComponents);

            if (!currentComponents.has(action.componentId)) {
                throw new Error(
                    'An attempt was made to update a component ' +
                    'that is not in current editing area'
                );
            }

            const path = [].concat(pathToCurrentComponents, [
                action.componentId,
                'props',
                action.propName
            ], ...action.path.map(index => ['sourceData', 'value', index]),
                'sourceData',
                'value'
            );

            return state.updateIn(path, mapOrList => {
                if (List.isList(mapOrList)) {
                    if (typeof action.index !== 'number')
                        throw new Error('');

                    return mapOrList.delete(action.index);
                }
                else if (Map.isMap(mapOrList)) {
                    if (typeof action.index !== 'string' || !action.index)
                        throw new Error('');

                    return mapOrList.delete(action.index);
                }
                else {
                    throw new Error('');
                }
            });
        }

        case PROJECT_COMPONENT_RENAME: {
            const pathToCurrentComponents = getPathToCurrentComponents(state),
                currentComponents = state.getIn(pathToCurrentComponents);

            if (!currentComponents.has(action.componentId)) {
                throw new Error(
                    'An attempt was made to update a component ' +
                    'that is not in current editing area'
                );
            }

            const path = [].concat(pathToCurrentComponents, [
                action.componentId,
                'title'
            ]);

            return state.setIn(path, action.newTitle);
        }

        case PROJECT_COMPONENT_TOGGLE_REGION: {
            const pathToCurrentComponents = getPathToCurrentComponents(state),
                currentComponents = state.getIn(pathToCurrentComponents);

            if (!currentComponents.has(action.componentId)) {
                throw new Error(
                    'An attempt was made to update a component ' +
                    'that is not in current editing area'
                );
            }

            const path = [].concat(pathToCurrentComponents, [
                action.componentId,
                'regionsEnabled'
            ]);

            return state.updateIn(path, regionsEnabled => action.enable
                ? regionsEnabled.add(action.regionIdx)
                : regionsEnabled.delete(action.regionIdx)
            );
        }

        case PREVIEW_HIGHLIGHT_COMPONENT: {
            return highlightComponent(state, action.componentId);
        }

        case PREVIEW_UNHIGHLIGHT_COMPONENT: {
            return unhighlightComponent(state, action.componentId);
        }

        case PREVIEW_SELECT_COMPONENT: {
            state = state.set('showAllComponentsOnPalette', false);

            return action.exclusive
                ? selectComponentExclusive(state, action.componentId)
                : selectComponent(state, action.componentId);
        }

        case PREVIEW_DESELECT_COMPONENT: {
            state = state.set('showAllComponentsOnPalette', false);
            return deselectComponent(state, action.componentId);
        }

        case PREVIEW_TOGGLE_COMPONENT_SELECTION: {
            state = state.set('showAllComponentsOnPalette', false);
            return toggleComponentSelection(state, action.componentId);
        }

        case PREVIEW_SET_CURRENT_ROUTE: {
            state = closeAllNestedConstructors(state);

            return state.merge({
                currentRouteId: action.routeId,
                currentRouteIsIndexRoute: action.isIndexRoute
            });
        }

        case PREVIEW_START_DRAG_NEW_COMPONENT: {
            if (state.selectingComponentLayout) return state;

            return state.merge({
                draggingComponent: true,
                draggedComponentId: -1,
                draggedComponents: action.components,
                highlightingEnabled: false,
                highlightedItems: Set()
            });
        }

        case PREVIEW_START_DRAG_EXISTING_COMPONENT: {
            if (state.selectingComponentLayout) return state;

            const pathToCurrentComponents = getPathToCurrentComponents(state),
                currentComponents = state.getIn(pathToCurrentComponents);

            if (!currentComponents.has(action.componentId)) {
                throw new Error(
                    'An attempt was made to drag a component ' +
                    'that is not in current editing area'
                );
            }

            return state.merge({
                draggingComponent: true,
                draggedComponentId: action.componentId,
                draggedComponents: currentComponents,
                highlightingEnabled: false,
                highlightedItems: Set()
            });
        }

        case PREVIEW_DROP_COMPONENT: {
            if (!state.draggingComponent) return state;
            if (!state.draggingOverPlaceholder) return initDNDState(state);

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
                const rootComponent = state.draggedComponents.get(0),
                    componentMeta = getComponentMeta(rootComponent.name, state.meta);

                const isCompositeComponentWithMultipleLayouts =
                    componentMeta.kind === 'composite' &&
                    componentMeta.layouts.length > 1;

                if (isCompositeComponentWithMultipleLayouts) {
                    // The component is composite and has multiple layouts;
                    // we need to ask user which one to use
                    return state.merge({
                        selectingComponentLayout: true,
                        draggingComponent: false
                    });
                }
                else {
                    // No layout options, inserting what we already have
                    state = insertDraggedComponents(state, state.draggedComponents);
                    return initDNDState(state);
                }
            }
        }

        case PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT: {
            if (!state.selectingComponentLayout) return state;

            const components = action.layoutIdx === 0
                ? state.draggedComponents

                : constructComponent(
                    state.draggedComponents.get(0).name,
                    action.layoutIdx,
                    state.languageForComponentProps,
                    state.meta
                );

            state = insertDraggedComponents(state, components);
            state = state.set('selectingComponentLayout', false);
            return initDNDState(state);
        }

        case PROJECT_CONSTRUCT_COMPONENT_FOR_PROP: {
            const pathToCurrentComponents = getPathToCurrentComponents(state),
                components = state.getIn(pathToCurrentComponents),
                component = components.get(action.componentId),
                currentValue = getValueByPath(component, action.propName, action.path),
                componentMeta = getComponentMeta(component.name, state.meta);

            const propMeta = getNestedTypedef(
                componentMeta.props[action.propName],
                action.path
            );

            if (propMeta.source.indexOf('designer') === -1) {
                throw new Error(
                    'An attempt was made to construct a component ' +
                    'for prop that does not have \'designer\' source option'
                );
            }

            const nestedConstructorData = {
                componentId: action.componentId,
                prop: action.propName,
                path: action.path
            };

            if (currentValue && currentValue.source === 'designer') {
                Object.assign(nestedConstructorData, {
                    components: currentValue.sourceData.components,
                    rootId: currentValue.sourceData.rootId,
                    lastComponentId: currentValue.sourceData.components.size > 0
                        ? currentValue.sourceData.components.keySeq().max()
                        : -1
                });
            }
            else if (propMeta.sourceConfigs.designer.wrapper) {
                const { namespace } = parseComponentName(component.name);

                const wrapperFullName = formatComponentName(
                    namespace,
                    propMeta.sourceConfigs.designer.wrapper
                );

                const wrapperComponents = constructComponent(
                    wrapperFullName,
                    propMeta.sourceConfigs.designer.wrapperLayout || 0,
                    state.languageForComponentProps,
                    state.meta,
                    { isNew: false, isWrapper: true }
                );

                Object.assign(nestedConstructorData, {
                    components: wrapperComponents,
                    rootId: 0,
                    lastComponentId: wrapperComponents.size - 1
                });
            }

            const nestedConstructor = new NestedConstructor(nestedConstructorData);
            return openNestedConstructor(state, nestedConstructor);
        }

        case PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP: {
            return closeTopNestedConstructor(state);
        }

        case PROJECT_SAVE_COMPONENT_FOR_PROP: {
            const topConstructor = getTopNestedConstructor(state);
            state = closeTopNestedConstructor(state);

            const pathToCurrentComponents = getPathToCurrentComponents(state),
                currentComponents = state.getIn(pathToCurrentComponents);

            if (!currentComponents.has(topConstructor.componentId)) {
                throw new Error(
                    'Failed to save component created by nested constructor: ' +
                    'owner component is not in current editing area'
                );
            }

            const newValue = new ProjectComponentProp({
                source: 'designer',
                sourceData: new SourceDataDesigner({
                    components: topConstructor.components,
                    rootId: topConstructor.rootId
                })
            });

            const path = [].concat(pathToCurrentComponents, [
                topConstructor.componentId,
                'props',
                topConstructor.prop
            ], ...topConstructor.path.map(index => ['sourceData', 'value', index]));

            return state.setIn(path, newValue);
        }

        case PROJECT_LINK_PROP: {
            return state
                .merge({
                    linkingProp: true,
                    linkingPropOfComponentId: action.componentId,
                    linkingPropName: action.propName
                })
                .set('linkingPropPath', action.path); // Prevent conversion to List
        }

        case PROJECT_LINK_WITH_OWNER_PROP: {
            const pathToCurrentComponents = getPathToCurrentComponents(state);

            const path = [].concat(
                pathToCurrentComponents,
                [state.linkingPropOfComponentId, 'props', state.linkingPropName],
                ...state.linkingPropPath.map(index => ['sourceData', 'value', index])
            );

            const oldValue = state.getIn(path);

            const newValue = new ProjectComponentProp({
                source: 'static',
                sourceData: new SourceDataStatic({
                    value: oldValue.source === 'static'
                        ? oldValue.sourceData.value
                        : NO_VALUE, // TODO: Build default value for type when link will be removed

                    ownerPropName: action.ownerPropName
                })
            });

            return state
                .setIn(path, newValue)
                .merge({
                    linkingProp: false,
                    linkingPropOfComponentId: -1,
                    linkingPropName: ''
                })
                .set('linkingPropPath', action.path); // Prevent conversion to List
        }

        case PROJECT_LINK_PROP_CANCEL: {
            return state
                .merge({
                    linkingProp: false,
                    linkingPropOfComponentId: -1,
                    linkingPropName: ''
                })
                .set('linkingPropPath', action.path); // Prevent conversion to List
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

        case APP_LOCALIZATION_LOAD_SUCCESS: {
            return state.set('languageForComponentProps', action.language);
        }

        case LIBRARY_SHOW_ALL_COMPONENTS: {
            return state.set('showAllComponentsOnPalette', true);
        }

        default:
            return state;
    }
};
