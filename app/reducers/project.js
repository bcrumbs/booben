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
    PROJECT_ROUTE_RENAME
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
    uid: input.uid,
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

const projectRouteToImmutable = input => new ProjectRoute({
    id: input.id,
    path: input.path,
    component: projectComponentToImmutable(input.component),
    children: List(input.children.map(projectRouteToImmutable))
});

const projectToImmutable = input => new Project({
    name: input.name,
    author: input.author,
    componentLibs: List(input.componentLibs),
    relayEndpointURL: input.relayEndpointURL,
    routes: List(input.routes.map(projectRouteToImmutable))
});

const ProjectState = Record({
    projectName: '',
    loadState: NOT_LOADED,
    data: null,
    meta: null,
    error: null
});

export default (state = new ProjectState(), action) => {
    switch (action.type) {
        case PROJECT_REQUEST:
            return state.merge({
                projectName: action.projectName,
                loadState: LOADING
            });

        case PROJECT_LOADED:
            return state.merge({
                projectName: action.project.name,
                loadState: LOADED,
                data: projectToImmutable(action.project),

                // Metadata cannot be changed at all,
                // so there's no need to convert it to Immutable.js containers
                meta: action.metadata,

                error: null
            });

        case PROJECT_LOAD_FAILED:
            return state.merge({
                loadState: LOAD_ERROR,
                data: null,
                meta: null,
                error: action.error
            });

        case PROJECT_ROUTE_CREATE:
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

        case PROJECT_ROUTE_DELETE:
            return state.updateIn(
                ['data', 'routes'].concat(...action.where.map(idx => [idx, 'children'])),
                routes => routes.delete(action.idx)
            );

        case PROJECT_ROUTE_RENAME:
            return state.setIn(
                ['data', 'routes'].concat(
                    ...action.where.map(idx => [idx, 'children']),
                    action.idx,
                    'title'
                ),

                action.newTitle
            );

        default:
            return state;
    }
};
