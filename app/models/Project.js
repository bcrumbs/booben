/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map, Set } from 'immutable';

import {
    projectRouteToImmutable,
    getMaxComponentId as _getMaxComponentId,
    getOutletComponentId,
    getParentComponentId,
    isRootRoute
} from './ProjectRoute';

import {
    isRootComponent
} from './ProjectComponent';

import { concatPath } from '../utils';

const ProjectRecord = Record({
    name: '',
    author: '',
    componentLibs: List(),
    relayEndpointURL: null,
    routes: Map(),
    rootRoutes: List()
});

export const projectToImmutable = input => new ProjectRecord({
    name: input.name,
    author: input.author,
    componentLibs: List(input.componentLibs),
    relayEndpointURL: input.relayEndpointURL || '',
    routes: Map().withMutations(routes => {
        const visitRoute = (route, pathPrefix, parentRouteId) => {
            const fullPath = concatPath(pathPrefix, route.path);
            routes.set(route.id, projectRouteToImmutable(route, fullPath, parentRouteId));
            route.children.forEach(route => visitRoute(route, fullPath, route.id));
        };

        input.routes.forEach(route => visitRoute(route, '', -1));
    }),

    rootRoutes: List(input.routes.map(route => route.id))
});

export const getMaxRouteId = project => project.routes.keySeq().max();

export const getMaxComponentId = project =>
    Math.max(-1, ...project.routes.toList().map(_getMaxComponentId));

export const gatherRoutesTreeIds = (project, rootRouteId) =>
    Set().withMutations(ret => {
        const visitRoute = route => {
            ret.add(route.id);

            route.children.forEach(childRouteId =>
                void visitRoute(project.routes.get(childRouteId)));
        };

        visitRoute(project.routes.get(rootRouteId));
    });

export const getRouteByComponentId = (project, componentId) =>
    project.routes.find(route => route.components.has(componentId));

export const getComponentById = (project, componentId) =>
    getRouteByComponentId(project, componentId).components.get(componentId);

export const getEnclosingComponent = (project, componentId) => {
    const route = getRouteByComponentId(project, componentId),
        component = route.components.get(componentId);

    if (!isRootComponent(component)) {
        return route.components.get(component.parentId);
    }
    else {
        if (component.isIndexRoute) {
            const outletId = getOutletComponentId(route);
            if (outletId === -1) return null;
            const parentId = getParentComponentId(route, outletId);
            return parentId > -1 ? route.components.get(parentId) : null;
        }
        else if (!isRootRoute(route)) {
            const parentRoute = project.routes.get(route.parentId),
                outletId = getOutletComponentId(parentRoute);

            if (outletId === -1) return null;
            const parentId = getParentComponentId(parentRoute, outletId);
            return parentId > -1 ? parentRoute.components.get(parentId) : null;
        }
        else {
            return null;
        }
    }
};

export default ProjectRecord;
