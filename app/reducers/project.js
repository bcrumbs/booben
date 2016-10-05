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
    PROJECT_ROUTE_RENAME,
    PROJECT_ROUTE_UPDATE_PATH,
    PROJECT_ROUTE_UPDATE_DESCRIPTION,
    PROJECT_ROUTE_UPDATE_IS_INDEX,
    PROJECT_ROUTE_COMPONENT_UPDATE,
    PROJECT_ROUTE_COMPONENT_DELETE,
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
    isIndex: input.isIndex,
    title: input.title,
    description: input.description,

    component: input.component !== null
        ? projectComponentToImmutable(input.component)
        : null,

    children: List(input.children.map(projectRouteToImmutable))
});

const projectToImmutable = input => new Project({
    name: input.name,
    author: input.author,
    componentLibs: List(input.componentLibs),
    relayEndpointURL: input.relayEndpointURL,
    routes: List(input.routes.map(projectRouteToImmutable))
});

const updateRouteField = (state, where, idx, field, newValue) => state.setIn(
    ['data', 'routes'].concat(...where.map(idx => [idx, 'children']), idx, field),
    newValue
);

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
            return updateRouteField(
                state,
                action.where,
                action.idx,
                'title',
                action.newTitle
            );

        case PROJECT_ROUTE_UPDATE_PATH:
            return updateRouteField(
                state,
                action.where,
                action.idx,
                'path',
                action.newPath
            );

        case PROJECT_ROUTE_UPDATE_DESCRIPTION:
            return updateRouteField(
                state,
                action.where,
                action.idx,
                'description',
                action.newDescription
            );

        case PROJECT_ROUTE_UPDATE_IS_INDEX:
            return updateRouteField(
                state,
                action.where,
                action.idx,
                'isIndex',
                action.newIsIndex
            );

        case PROJECT_ROUTE_COMPONENT_UPDATE:
            const whereSource = ['data', 'routes'].concat(...action.source),
                whereTarget = ['data', 'routes'].concat(...action.target);

            const sourceComponent = state.getIn(whereSource),
                targetComponent = state.getIn(whereTarget);

            return state.deleteIn(whereSource)
                 .updateIn([...whereTarget, 'children'], list => list.push(sourceComponent));

        case PROJECT_ROUTE_COMPONENT_DELETE:
            const where = ['data', 'routes'].concat(...action.where);

            return state.deleteIn(where);

        default:
            return state;
    }
};
