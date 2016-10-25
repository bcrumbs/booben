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
import ProjectComponent from '../models/ProjectComponent';
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

/**
 *
 * @param {Project} project
 * @return {Immutable.Map}
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

const buildRoutesIndex = project => Map().withMutations(ret => {
    const visitRoute = (route, path) => {
        ret.set(route.id, {path});
        route.children.forEach((child, idx) =>
            void visitRoute(child, [].concat(path, 'children', idx)));
    };

    project.routes.forEach((route, idx) => void visitRoute(route, ['routes', idx]));
});

const getMaxComponentId = component => {
    if (!component) return -1;

    const reducer = (acc, component) =>
        Math.max(acc, component.id, component.children.reduce(reducer, acc));

    return Math.max(component.id, component.children.reduce(reducer, -1));
};

const getLastComponentId = state => {
    const reducer = (acc, route) => {
        const id1 = getMaxComponentId(route.component),
            id2 = getMaxComponentId(route.indexComponent),
            id3 = route.children.reduce(reducer, acc);

        return Math.max(acc, id1 ,id2, id3);
    };

    return state.data.routes.reduce(reducer, -1);
};

const getLastRouteId = state => {
    const reducer = (acc, route) =>
        Math.max(acc, route.id, route.children.reduce(reducer, acc));

    return state.data.routes.reduce(reducer, -1);
};

const deepDeleteRoutesIndex = (state, id) => {
    const curPath = state.routesIndex.get(id).path,
        route = state.getIn(['data', ...curPath]);

    if(!route) return state;

    route.children && route.children.forEach((child) => {
        state = deepDeleteRoutesIndex(state, child.id);
    });

    return state.deleteIn(['routesIndex', route.id])
};

const deepDeleteComponentIndex = (state, id) => {
    const curPath = state.getIn(['componentsIndex', id, 'path']),
        component = state.getIn(['data', ...curPath]);

    if (component.children.size) component.children.forEach(child => {
        state = deepDeleteComponentIndex(state, child.id);
    });

    return state.deleteIn(['componentsIndex', id]);
};

const deepShiftComponentIndex = (state, id, basePath) => {
    const curPath = state.getIn(['componentsIndex', id, 'path']),
        component = state.getIn(['data', ...curPath]);

    if (component && component.children && component.children.size > 0) {
        component.children.forEach((child) => {
            state = deepShiftComponentIndex(state, child.id, basePath);
        });
    }

    const oldPath = state.getIn(['componentsIndex', id, 'path']);

    return state.setIn(['componentsIndex', id, 'path'],
            basePath.concat(oldPath.slice(basePath.size)))
};

const deepSetComponentIndex = (state, component, componentIndexImage) => {
    const newIndex = new ComponentsIndexEntry({
        path: componentIndexImage.path,
        routeId: componentIndexImage.routeId,
        isIndexRoute: componentIndexImage.isIndexRoute
    });

    state = state.setIn(["componentsIndex", component.id], newIndex);

    if (component && component.children.size) component.children.forEach((child, i) => {
        const newShiftIndex = new ComponentsIndexEntry({
            path: componentIndexImage.path.concat('children', i),
            routeId: componentIndexImage.routeId,
            isIndexRoute: componentIndexImage.isIndexRoute
        });

        state = deepSetComponentIndex(
            state,
            child,
            newShiftIndex
        );
    });

    return state;
};

const deleteComponent = (state, id) => {
    if(!state.componentsIndex.has(id)) return state;

    const componentIndexData = state.componentsIndex.get(id);

    state = deepDeleteComponentIndex(state, id);

    const componentPath = componentIndexData.path,
        componentIndex = componentPath.last(),
        component = state.getIn(['data', ...componentPath.slice(0, -1)]);

    if (List.isList(component)) {
        const componentsToShift = component.slice(componentIndex + 1);

        if (componentsToShift.size) {
            componentsToShift.forEach(item => {
                const basePath = state.getIn(['componentsIndex', item.id, 'path']);

                state = deepShiftComponentIndex(
                    state,
                    item.id,
                    basePath.slice(0, -1).concat(basePath.last() - 1)
                );
            });
        }
    }

    return state.deleteIn(['data', ...componentPath]);
};

const createComponent = (state, targetId, position, component) => {
    const targetPath = state.getIn(['componentsIndex', targetId, 'path']),
        componentList = state.getIn(['data', ...targetPath, 'children']);

    let part0, part1;

    if (position > - 1) {
        part0 = componentList.slice(0, position + 1);
        part1 = componentList.slice(position + 1);
    }
    else {
        part0 = List();
        part1 = componentList;
    }

    const newValue = part0.push(component).concat(part1);

    if (part1.size) {
        part1.map((item) => {
            const basePath = state.getIn(['componentsIndex', item.id, 'path']);

            state = deepShiftComponentIndex(
                state,
                item.id,
                basePath.slice(0, -1).concat(basePath.last() + 1)
            );
        })
    }

    const componentIndexImage = state.getIn(["componentsIndex", targetId]);

    state = deepSetComponentIndex(state, component, {
        isIndexRoute: componentIndexImage.isIndexRoute,
        routeId: componentIndexImage.routeId,
        path: targetPath.concat('children', position !== null && position + 1 || 0)
    });

    return state.setIn(['data', ...targetPath, 'children'], newValue);
};

const ProjectState = Record({
    projectName: '',
    loadState: NOT_LOADED,
    data: null,
    meta: null,
    error: null,
    componentsIndex: Map(),
    routesIndex: Map()
});

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
            const newRouteId = getLastRouteId(state) + 1,
                parentRouteChildrenPath = action.where.reduce(
                    (prev, cur) => prev.concat(cur, 'children'), []),
                newRoutePosition = state.getIn(['data', 'routes', 
                    ...parentRouteChildrenPath]).size,
                newRoutePath = parentRouteChildrenPath.concat(newRoutePosition);

            const newRoute = new ProjectRoute({
                id: newRouteId,
                path: action.path,
                title: action.title
            });

            return state
                .setIn(['data', 'routes', ...newRoutePath], newRoute)
                .setIn(['routesIndex', newRouteId], {path: newRoutePath});
        }

        case PROJECT_ROUTE_DELETE: {
            const parentRouteChildrenPath = action.where.reduce(
                    (prev, cur) => prev.concat(cur, 'children'), []),
                deleteRoute = state.getIn(['data', 'routes',
                    ...parentRouteChildrenPath, action.idx]);

            state = deepDeleteRoutesIndex(state, deleteRoute.id);

            return state
                .deleteIn([
                    'data',
                    'routes',
                    ...parentRouteChildrenPath,
                    action.idx
                ])
                .deleteIn(['routesIndex', deleteRoute.id]);
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
            const newComponentId = getLastComponentId(state) + 1;

            const newComponent = new ProjectComponent({
                id: newComponentId,
                name: action.componentName
            });

            const routePath = state.getIn(['routesIndex', action.routeId, 'path']);
            const componentPath = routePath.concat(action.isIndexRoute ? 'indexComponent' : 'component');

            const newIndex = new ComponentsIndexEntry({
                path: componentPath,
                isIndexRoute: action.isIndexRoute,
                routeId: action.routeId
            });

            return state
                .setIn(['data', ...componentPath], newComponent)
                .setIn(['componentsIndex', newComponentId], newIndex);
        }

        case PROJECT_COMPONENT_CREATE: {
            return createComponent(
                state,
                action.targetId,
                action.position,
                action.component.set('id', getLastComponentId(state) + 1)
            );
        }


        case PROJECT_COMPONENT_MOVE: {
            const componentPath = state.getIn([
                    'componentsIndex',
                    action.sourceId,
                    'path'
                ]),
                componentSource = state.getIn(['data', ...componentPath]),
                componentSourcePosition = componentPath.last(),
                componentSourceParent = state.getIn(['data',
                    ...componentPath.slice(0, -2)]);

            let targetPosition = action.position;

            state = deleteComponent(state, action.sourceId);

            if (
                componentSourceParent.id === action.targetId &&
                action.position > componentSourcePosition
            ) {
                targetPosition = targetPosition - 1;
            }

            return createComponent(
                state,
                action.targetId,
                targetPosition,
                componentSource
            );
        }

        case PROJECT_COMPONENT_DELETE: {
            return deleteComponent(state, action.id);
        }

        case PROJECT_COMPONENT_UPDATE_PROP_VALUE: {
            const componentIndexData = state.componentsIndex.get(action.componentId),
                path = componentIndexData.path;

            const newValue = new ProjectComponentProp({
                source: action.newSource,
                sourceData: propSourceDataToImmutable[action.newSource](
                    action.newSourceData
                )
            });

            return state.setIn(['data', ...path, 'props', action.propName], newValue);
        }

        case PROJECT_COMPONENT_RENAME: {
            const componentIndexData = state.componentsIndex.get(action.componentId),
                path = componentIndexData.path;

            return state.setIn(['data', ...path, 'title'], action.newTitle);
        }

        default:
            return state;
    }
};
