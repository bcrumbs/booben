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
    PROJECT_COMPONENT_MOVE
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

const deepShiftComponentIndex = (state, id, basePath) => {
    const curPath = state.componentsIndex.get(id).path,
        component = state.getIn(['data', ...curPath]);

    if(component && component.children.size) component.children.map((child) => {
        state = deepShiftComponentIndex(
            state,
            child.id,
            basePath
        );
    });

    return state.updateIn(['componentsIndex', id],
        (item) => {
            item.path = basePath.concat(item.path.slice(basePath.length));
            return item;
        }
    )
};

const deepSetComponentIndex = (state, id, componentIndexImage) => {
    state = state.setIn(["componentsIndex", id], {
        path: componentIndexImage.path,
        routeId: componentIndexImage.routeId,
        isIndexRoute: componentIndexImage.isIndexRoute
    });

    return state;
}

const deleteComponent = (state, id) => {
    if(!state.componentsIndex.has(id)) return state;

    const componentIndexData = state.componentsIndex.get(id);

    state = deepDeleteComponentIndex(state, id);

    const componentPath = componentIndexData.path,
        componentIndex = componentPath.slice(-1)[0],
        component = state.getIn(['data', ...componentPath.slice(0, -1)]);

    if (List.isList(component)) {
        const componentsToShift = component.slice(componentIndex + 1);

        if (componentsToShift.size) {
            componentsToShift.forEach(item => {
                const basePath = state.componentsIndex.get(item.id).path;
                basePath[basePath.length - 1] = parseInt(basePath.slice(-1)) - 1;

                state = deepShiftComponentIndex(
                    state,
                    item.id,
                    basePath
                );
            });
        }
    }

    return state.deleteIn(['data', ...componentIndexData.path]);
}

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

        case PROJECT_COMPONENT_MOVE: {
            const sourceData = state.getIn(["componentsIndex", action.sourceId]),
                component = state.getIn(['data', ...sourceData.path]);

            state = deleteComponent(state, action.sourceId);

            const targetPath = state.componentsIndex.getIn([action.targetId]).path,
                componentList = state.getIn(['data', ...targetPath, 'children']);

            let part0 = componentList.slice(0, action.position + 1);
            let part1 = componentList.slice(action.position + 1);

            const newValue = part0.push(component).concat(part1);

            if (part1.size) {
                part1.map((item) => {
                    const basePath = state.componentsIndex.get(item.id).path;
                    basePath[basePath.length - 1] = parseInt(basePath.slice(-1)) + 1;

                    state = deepShiftComponentIndex(
                        state,
                        item.id,
                        basePath
                    );
                })
            }

            const componentIndexImage = state.getIn(
                ["componentsIndex", action.targetId]
            );

            state = deepSetComponentIndex(state, action.sourceId, {
                isIndexRoute: componentIndexImage.isIndexRoute,
                routeId: componentIndexImage.routeId,
                path: targetPath.concat('children', action.position + 1)
            });

            return state
                .setIn(['data', ...targetPath, 'children'], newValue);
        }

        case PROJECT_COMPONENT_DELETE: {
            return deleteComponent(state, action.id);
        }

        case PROJECT_COMPONENT_UPDATE_PROP_VALUE: {
            const componentIndexData = state.componentsIndex.get(action.componentId),
                path = componentIndexData.get('path');

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
                path = componentIndexData.get('path');

            return state.setIn(['data', ...path, 'title'], action.newTitle);
        }

        default:
            return state;
    }
};
