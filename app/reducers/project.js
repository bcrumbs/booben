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
    PROJECT_COMPONENT_DELETE,
    PROJECT_COMPONENT_UPDATE_PROP_VALUE,
    PROJECT_COMPONENT_RENAME,
    PROJECT_ROUTE_COMPONENT_ADD_BEFORE,
    PROJECT_ROUTE_COMPONENT_ADD_AFTER
} from '../actions/project';

import Project from '../models/Project';
import ProjectRoute from '../models/ProjectRoute';
import ProjectComponent from '../models/ProjectComponent';
import ProjectComponentProp from '../models/ProjectComponentProp';
import SourceDataStatic from '../models/SourceDataStatic';
import SourceDataData from '../models/SourceDataData';
import SourceDataConst from '../models/SourceDataConst';
import SourceDataAction from '../models/SourceDataAction';
import SourceDataDesigner from '../models/SourceDataDesigner';

import { Record, List, Map } from 'immutable';

const propSourceDataToImmutable = {
    static: input => new SourceDataStatic(input),
    data: input => new SourceDataData(input),
    const: input => new SourceDataConst(input),
    action: input => new SourceDataAction(input),
    designer: input => new SourceDataDesigner(input)
};

const projectComponentToImmutable = input => new ProjectComponent({
    id: input.id,
    name: input.name,
    title: input.title,

    props: Map(Object.keys(input.props).reduce(
        (acc, cur) => Object.assign(acc, {
            [cur]: new ProjectComponentProp({
                source: input.props[cur].source,
                sourceData: propSourceDataToImmutable[input.props[cur].source](
                    input.props[cur].sourceData
                )
            })
        }),

        {}
    )),

    children: List(input.children.map(projectComponentToImmutable))
});

const projectRouteToImmutable = (input, pathPrefix) => {
    const fullPath = pathPrefix + input.path,
        nextPrefix = fullPath.endsWith('/') ? fullPath : fullPath + '/';

    return new ProjectRoute({
        id: input.id,
        path: input.path,
        fullPath: fullPath,
        title: input.title,
        description: input.description,
        haveIndex: input.haveIndex,
        indexComponent: input.indexComponent !== null
            ? projectComponentToImmutable(input.indexComponent)
            : null,

        haveRedirect: input.haveRedirect,
        redirectTo: input.redirectTo,

        component: input.component !== null
            ? projectComponentToImmutable(input.component)
            : null,

        children: List(input.children.map(
            route => projectRouteToImmutable(route, nextPrefix))
        )
    });
};

const projectToImmutable = input => new Project({
    name: input.name,
    author: input.author,
    componentLibs: List(input.componentLibs),
    relayEndpointURL: input.relayEndpointURL,
    routes: List(input.routes.map(route => projectRouteToImmutable(route, '')))
});

/**
 *
 * @param {Project} project
 * @return {Immutable.Map}
 */
const buildComponentsIndex = project => Map().withMutations(ret => {
    const visitComponent = (component, routeId, path, isIndexRoute) => {
        ret.set(component.id, { path, routeId, isIndexRoute });

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

const deepDeleteComponentIndex = (state, id) => {
    const curPath = state.componentsIndex.get(id).path,
        component = state.getIn(['data', ...curPath]);

    if(component.children.size) component.children.map((child) => {
        state = deepDeleteComponentIndex(state, child.id);
    });

    return state.deleteIn(['componentsIndex', id]);
};

const deepShiftComponentIndex = (state, id, newPathContaining, mutation) => {
    const curPath = state.componentsIndex.get(id).path,
        component = state.getIn(['data', ...curPath]);

    if(component && component.children.size) component.children.map((child) => {
        state = deepShiftComponentIndex(
            state,
            child.id,
            newPathContaining,
            mutation
        );
    });

    return state.updateIn(['componentsIndex', id],
        (item) => {
            item.path[newPathContaining.length] = mutation(
                item.path[newPathContaining.length]);

            return item;
        }
    )
};

const ProjectState = Record({
    projectName: '',
    loadState: NOT_LOADED,
    data: null,
    meta: null,
    error: null,
    componentsIndex: Map()
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
                    componentsIndex: buildComponentsIndex(action.project)
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
            const reducer = (acc, route) =>
                Math.max(route.id, route.children.reduce(reducer, acc));

            const newRouteId = state.data.routes.reduce(reducer, -1) + 1;

            const newRoute = new ProjectRoute({
                id: newRouteId,
                path: action.path,
                title: action.title
            });

            return state.updateIn(
                ['data', 'routes'].concat(...action.where.map(idx => [idx, 'children'])),
                routes => routes.push(newRoute)
            );
        }

        case PROJECT_ROUTE_DELETE: {
            return state.updateIn(
                ['data', 'routes'].concat(...action.where.map(idx => [idx, 'children'])),
                routes => routes.delete(action.idx)
            );
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

        case PROJECT_ROUTE_COMPONENT_ADD_BEFORE: {
            const targetPath = state.componentsIndex.get(action.targetId).path,
                componentList = state.getIn(['data', ...targetPath.slice(0, -1)]);

            let part0 = componentList.slice(0, targetPath.slice(-1)[0]);
            let part1 = componentList.slice(targetPath.slice(-1)[0]);

            const newValue = part0.push(action.component).concat(part1);

            if (part1.size) {
                part1.map((item) => {
                    state = deepShiftComponentIndex(
                        state,
                        item.id,
                        targetPath.slice(0, -1),
                        v => v + 1
                    );
                })
            }

            const componentIndexImage = state.getIn(
                ["componentsIndex", action.targetId]
            );

            return state
                .setIn(['data', ...targetPath.slice(0, -1)], newValue)
                .setIn(["componentsIndex", action.component.id], {
                    path: componentIndexImage.path.slice(0, -1).concat(componentIndexImage.path.slice(-1)[0] - 1),
                    routeId: componentIndexImage.routeId,
                    isIndexRoute: componentIndexImage.isIndexRoute
                });
        }

        case PROJECT_ROUTE_COMPONENT_ADD_AFTER: {
            const targetPath = state.componentsIndex.get(action.targetId).path,
                componentList = state.getIn(['data', ...targetPath.slice(0, -1)]);

            let part0 = componentList.slice(0, targetPath.slice(-1)[0] + 1);
            let part1 = componentList.slice(targetPath.slice(-1)[0] + 1);

            const newValue = part0.push(action.component).concat(part1);

            if (part1.size) {
                part1.map((item) => {
                    state = deepShiftComponentIndex(
                        state,
                        item.id,
                        targetPath.slice(0, -1),
                        v => v + 1
                    );
                })
            }

            const componentIndexImage = state.getIn(
                ["componentsIndex", action.targetId]
            );

            return state
                .setIn(['data', ...targetPath.slice(0, -1)], newValue)
                .setIn(["componentsIndex", action.component.id], {
                    path: componentIndexImage.path.slice(0, -1).concat(componentIndexImage.path.slice(-1)[0] + 1),
                    routeId: componentIndexImage.routeId,
                    isIndexRoute: componentIndexImage.isIndexRoute
                });
        }

        case PROJECT_COMPONENT_DELETE: {
            const componentIndexData = state.componentsIndex.get(action.id);
            if (!componentIndexData) return state;

            state = deepDeleteComponentIndex(state, action.id);

            const componentPath = componentIndexData.path,
                componentIndex = componentPath.slice(-1)[0],
                component = state.getIn(['data', ...componentPath.slice(0, -1)]);

            if (List.isList(component)) {
                const componentsToShift = component.slice(componentIndex + 1);

                if (componentsToShift.size) {
                    componentsToShift.forEach(item => {
                        state = deepShiftComponentIndex(
                            state,
                            item.id,
                            componentPath.slice(0, -1),
                            v => v - 1
                        );
                    });
                }
            }

            return state.deleteIn(['data', ...componentIndexData.path]);
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
