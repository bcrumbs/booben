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
    PROJECT_COMPONENT_RENAME
} from '../actions/project';

import ProjectRoute from '../models/ProjectRoute';
import ProjectComponentProp from '../models/ProjectComponentProp';
import SourceDataStatic from '../models/SourceDataStatic';
import SourceDataData from '../models/SourceDataData';
import SourceDataConst from '../models/SourceDataConst';
import SourceDataAction from '../models/SourceDataAction';
import SourceDataDesigner from '../models/SourceDataDesigner';

import { projectToImmutable } from '../models/Project';

import { Record, List, Map } from 'immutable';

const propSourceDataToImmutable = {
    static: input => new SourceDataStatic(input),
    data: input => new SourceDataData(input),
    const: input => new SourceDataConst(input),
    action: input => new SourceDataAction(input),
    designer: input => new SourceDataDesigner(input)
};

const ComponentsIndexEntry = Record({
    path: List(),
    routeId: null,
    isIndexRoute: false
});

const RoutesIndexEntry = Record({
    path: List()
});

/**
 *
 * @param {Project} project
 * @return {Immutable.Map<number, ComponentsIndexEntry>}
 */
const buildComponentsIndex = project => Map().withMutations(ret => {
    const visitComponent = (component, routeId, path, isIndexRoute) => {
        ret.set(component.id, new ComponentsIndexEntry({
            path: List(path),
            routeId,
            isIndexRoute
        }));

        component.children.forEach((child, idx) => void visitComponent(
            child,
            routeId,
            [].concat(path, 'children', idx),
            isIndexRoute
        ));
    };

    const visitRoute = (route, path) => {
        if (route.component !== null) {
            visitComponent(
                route.component,
                route.id,
                [].concat(path, 'component'),
                false
            );
        }

        if (route.indexComponent !== null) {
            visitComponent(
                route.indexComponent,
                route.id,
                [].concat(path, 'indexComponent'),
                true
            );
        }

        route.children.forEach((child, idx) =>
            void visitRoute(child, [].concat(path, 'children', idx)));
    };

    project.routes.forEach((route, idx) => void visitRoute(route, ['routes', idx]));
});

/**
 *
 * @param {Project} project
 * @return {Immutable.Map<number, RoutesIndexEntry>}
 */
const buildRoutesIndex = project => Map().withMutations(ret => {
    const visitRoute = (route, path) => {
        ret.set(route.id, new RoutesIndexEntry({
            path: List(path)
        }));

        route.children.forEach((child, idx) =>
            void visitRoute(child, [].concat(path, 'children', idx)));
    };

    project.routes.forEach((route, idx) => void visitRoute(route, ['routes', idx]));
});

/**
 *
 * @param {ProjectComponent} component
 * @returns {number}
 */
const getMaxComponentId = component => {
    if (!component) return -1;

    const reducer = (acc, component) =>
        Math.max(acc, component.id, component.children.reduce(reducer, acc));

    return Math.max(component.id, component.children.reduce(reducer, -1));
};

/**
 *
 * @param {Project} project
 * @returns {number}
 */
const getLastComponentId = project => {
    const reducer = (acc, route) => {
        const id1 = getMaxComponentId(route.component),
            id2 = getMaxComponentId(route.indexComponent),
            id3 = route.children.reduce(reducer, acc);

        return Math.max(acc, id1 ,id2, id3);
    };

    return project.routes.reduce(reducer, -1);
};

/**
 *
 * @param {Project} project
 * @returns {number}
 */
const getLastRouteId = project => {
    const reducer = (acc, route) =>
        Math.max(acc, route.id, route.children.reduce(reducer, acc));

    return project.routes.reduce(reducer, -1);
};

/**
 *
 * @param {Immutable.Map} state
 * @param {ProjectRoute} route
 * @returns {Immutable.Map}
 */
const deleteRouteFromIndex = (state, route) => {
    route.children.forEach(childRoute => {
        state = deleteRouteFromIndex(state, childRoute);
    });

    return state.deleteIn(['routesIndex', route.id]);
};

/**
 *
 * @param {Immutable.Map} state
 * @param {ProjectComponent} component
 * @returns {Immutable.Map}
 */
const deleteComponentFromIndex = (state, component) => {
    component.children.forEach(childComponent => {
        state = deleteComponentFromIndex(state, childComponent);
    });

    return state.deleteIn(['componentsIndex', component.id]);
};

/**
 *
 * @param {Immutable.Map} state
 * @param {ProjectComponent} component
 * @param {Immutable.List} path
 * @param {number} routeId
 * @param {boolean} isIndexRoute
 * @return {Immutable.Map}
 */
const addComponentToIndex = (state, component, path, routeId, isIndexRoute) =>
    state.update('componentsIndex', index => index.withMutations(mut => {
        const visitComponent = (c, path) => {
            mut.set(c.id, new ComponentsIndexEntry({
                path,
                routeId: routeId,
                isIndexRoute: isIndexRoute
            }));

            c.children.forEach((childComponent, idx) => void visitComponent(
                childComponent,
                path.concat(['children', idx])
            ));
        };

        visitComponent(component, path);
    }));

const deepReplaceComponentPathPrefix = (state, componentId, newPathPrefix) => {
    const pathToComponent = state.getIn(['componentsIndex', componentId, 'path']),
        component = state.getIn(['data', ...pathToComponent]);

    component.children.forEach(child => {
        state = deepReplaceComponentPathPrefix(state, child.id, newPathPrefix);
    });

    const oldPath = state.getIn(['componentsIndex', componentId, 'path']);

    return state.setIn(
        ['componentsIndex', componentId, 'path'],
        newPathPrefix.concat(oldPath.slice(newPathPrefix.size))
    );
};

const deleteComponent = (state, id) => {
    const componentIndexEntry = state.componentsIndex.get(id),
        componentPath = componentIndexEntry.path,
        componentIndex = componentPath.last(),
        component = state.getIn(['data', ...componentPath.slice(0, -1)]);

    state = deleteComponentFromIndex(state, component);

    if (List.isList(component)) {
        const componentsToShift = component.slice(componentIndex + 1);

        if (componentsToShift.size) {
            componentsToShift.forEach(item => {
                const basePath = state.getIn(['componentsIndex', item.id, 'path']);

                state = deepReplaceComponentPathPrefix(
                    state,
                    item.id,
                    basePath.slice(0, -1).concat(basePath.last() - 1)
                );
            });
        }
    }

    return state.deleteIn(['data', ...componentPath]);
};

/**
 *
 * @param {Immutable.Map} state
 * @param {number} containerId
 * @param {number} afterIdx
 * @param {ProjectComponent} component
 * @returns {Immutable.Map}
 */
const insertComponent = (state, containerId, afterIdx, component) => {
    const containerIndexEntry = state.getIn(['componentsIndex', containerId]),
        containerPath = containerIndexEntry.path,
        containerChildren = state.getIn(['data', ...containerPath, 'children']),
        part0 = containerChildren.slice(0, afterIdx + 1),
        part1 = containerChildren.slice(afterIdx + 1),
        newContainerChildren = part0.push(component).concat(part1);

    // Update project structure: insert new component
    state = state.setIn(['data', ...containerPath, 'children'], newContainerChildren);

    // Update component index: shift indexes of existing components
    part1.forEach(childComponent => {
        const oldPrefix = state.getIn(['componentsIndex', childComponent.id, 'path']),
            newPrefix = oldPrefix.update(oldPrefix.size - 1, n => n + 1);

        state = deepReplaceComponentPathPrefix(state, childComponent.id, newPrefix);
    });

    // Update component index: add entries for new components
    return addComponentToIndex(
        state,
        component,
        containerPath.concat(['children', afterIdx + 1]),
        containerIndexEntry.routeId,
        containerIndexEntry.isIndexRoute
    );
};

/**
 *
 * @param {Immutable.Map} state
 * @param {number} routeId
 * @param {boolean} isIndexRoute
 * @param {ProjectComponent} component
 * @returns {Immutable.Map}
 */
const setRootComponent = (state, routeId, isIndexRoute, component) => {
    const routePath = state.getIn(['routesIndex', routeId, 'path']),
        componentPath = routePath.concat(isIndexRoute ? 'indexComponent' : 'component');

    state = state.setIn(['data', ...componentPath], component);

    return addComponentToIndex(
        state,
        component,
        componentPath,
        routeId,
        isIndexRoute
    );
};

/**
 *
 * @param {Project} project
 * @param {ProjectComponent} component
 * @return {ProjectComponent}
 */
const setComponentId = (project, component) => {
    let lastComponentId = getLastComponentId(project);

    const setId = component => component.merge({
        id: ++lastComponentId,
        children: component.children.map(setId)
    });

    return setId(component);
};

/**
 * @class
 * @extends Immutable.Record
 */
const ProjectState = Record({
    projectName: '',
    loadState: NOT_LOADED,
    data: null,
    meta: null,
    error: null,
    componentsIndex: Map(),
    routesIndex: Map()
});

/**
 *
 * @param {Immutable.Map} state
 * @param {Immutable.List<number>} where
 * @param {number} idx
 * @param {string} field
 * @param {*} newValue
 * @return {Immutable.Map}
 */
const updateRouteField = (state, where, idx, field, newValue) => state.setIn(
    ['data', 'routes'].concat(...where.map(idx => [idx, 'children']), idx, field),
    newValue
);

export default (state = new ProjectState(), action) => {
    switch (action.type) {
        case PROJECT_REQUEST: {
            return state.merge({
                projectName: action.projectName,
                loadState: LOADING
            });
        }

        case PROJECT_LOADED: {
            return state
                .merge({
                    projectName: action.project.name,
                    loadState: LOADED,
                    data: projectToImmutable(action.project),
                    error: null,
                    componentsIndex: buildComponentsIndex(action.project),
                    routesIndex: buildRoutesIndex(action.project)
                })
                .set('meta', action.metadata); // Prevent conversion to Immutable.Map
        }

        case PROJECT_LOAD_FAILED: {
            return state.merge({
                loadState: LOAD_ERROR,
                data: null,
                meta: null,
                error: action.error,
                componentsIndex: Map()
            });
        }

        case PROJECT_ROUTE_CREATE: {
            const newRouteId = getLastRouteId(state.data) + 1;

            const routesListPath = action.where.reduce(
                (prev, cur) => prev.concat(cur, 'children'),
                ['routes']
            );

            const newRoutePosition = state.getIn(['data', ...routesListPath]).size,
                newRoutePath = routesListPath.concat(newRoutePosition);

            const newRoute = new ProjectRoute({
                id: newRouteId,
                path: action.path,
                title: action.title
            });

            const newRouteIndex = new RoutesIndexEntry({
                path: List(newRoutePath)
            });

            return state
                .setIn(['data', ...newRoutePath], newRoute)
                .setIn(['routesIndex', newRouteId], newRouteIndex);
        }

        case PROJECT_ROUTE_DELETE: {
            const routesListPath = action.where.reduce(
                (prev, cur) => prev.concat(cur, 'children'),
                ['routes']
            );

            const route = state.getIn(['data', ...routesListPath, action.idx]);

            // Clean components index
            if (route.component)
                state = deleteComponentFromIndex(state, route.component);

            if (route.indexComponent)
                state = deleteComponentFromIndex(state, route.indexComponent);

            // Clean routes index
            state = deleteRouteFromIndex(state, route);

            // Delete route from project
            state = state.deleteIn(['data', ...routesListPath, action.idx]);

            const routesToUpdateIndex = state
                .getIn(['data', ...routesListPath])
                .slice(action.idx);

            // 'routes' + <index, 'children'> for each level
            const pathIndexToDecrement = 1 + action.where.size * 2;

            const shiftIndexInComponentPath = component => {
                state = state.updateIn(
                    ['componentsIndex', component.id, 'path', pathIndexToDecrement],
                    n => n - 1
                );

                component.children.forEach(shiftIndexInComponentPath);
            };

            const shiftIndexInRoutePath = route => {
                console.log(['routesIndex', route.id, 'path', pathIndexToDecrement]);
                console.log(state.getIn(['routesIndex', route.id, 'path']));

                state = state.updateIn(
                    ['routesIndex', route.id, 'path', pathIndexToDecrement],
                    n => n - 1
                );

                if (route.component) shiftIndexInComponentPath(route.component);
                if (route.indexComponent) shiftIndexInComponentPath(route.indexComponent);

                route.children.forEach(shiftIndexInRoutePath);
            };

            routesToUpdateIndex.forEach(shiftIndexInRoutePath);

            return state;
        }

        case PROJECT_ROUTE_UPDATE_FIELD: {
            return updateRouteField(
                state,
                action.where,
                action.idx,
                action.field,
                action.newValue
            );
        }

        case PROJECT_COMPONENT_CREATE_ROOT: {
            return setRootComponent(
                state,
                action.routeId,
                action.isIndexRoute,
                setComponentId(state.data, action.component)
            )
        }

        case PROJECT_COMPONENT_CREATE: {
            return insertComponent(
                state,
                action.targetId,
                action.position,
                setComponentId(state.data, action.component)
            );
        }

        case PROJECT_COMPONENT_MOVE: {
            const componentPath = state.getIn(
                ['componentsIndex', action.sourceId, 'path']
            );

            const component = state.getIn(['data', ...componentPath]),
                componentPosition = componentPath.last(),
                parentComponent = state.getIn(['data', ...componentPath.slice(0, -2)]);

            let targetPosition = action.position;

            state = deleteComponent(state, action.sourceId);

            if (
                parentComponent.id === action.targetId &&
                action.position > componentPosition
            ) {
                targetPosition = targetPosition - 1;
            }

            return insertComponent(
                state,
                action.targetId,
                targetPosition,
                component
            );
        }

        case PROJECT_COMPONENT_DELETE: {
            return deleteComponent(state, action.componentId);
        }

        case PROJECT_COMPONENT_UPDATE_PROP_VALUE: {
            const componentIndexEntry = state.componentsIndex.get(action.componentId),
                path = componentIndexEntry.path,
                convertSourceData = propSourceDataToImmutable[action.newSource];

            const newValue = new ProjectComponentProp({
                source: action.newSource,
                sourceData: convertSourceData(action.newSourceData)
            });

            return state.setIn(['data', ...path, 'props', action.propName], newValue);
        }

        case PROJECT_COMPONENT_RENAME: {
            const componentIndexEntry = state.componentsIndex.get(action.componentId),
                path = componentIndexEntry.path;

            return state.setIn(['data', ...path, 'title'], action.newTitle);
        }

        default:
            return state;
    }
};
