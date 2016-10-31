/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map, Set } from 'immutable';
import {
    projectRouteToImmutable,
    getMaxComponentId as _getMaxComponentId
} from './ProjectRoute';

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
        const concatPath = (prefix, path) => {
            if (prefix === '') return path;
            if (prefix === '/') return '/' + path;
            return prefix + '/' + path;
        };

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
    Math.max(...project.routes.map(_getMaxComponentId));

export const gatherRoutesTreeIds = (project, rootRouteId) =>
    Set().withMutations(ret => {
        const visitRoute = route => {
            ret.add(route.id);

            route.children.forEach(childRouteId =>
                void visitRoute(project.routes.get(childRouteId)));
        };

        visitRoute(project.routes.get(rootRouteId));
    });

export const gatherComponentsTreeIds = (route, rootComponentId) =>
    Set().withMutations(ret => {
        const visitComponent = component => {
            ret.add(component.id);

            component.children.forEach(childComponentId =>
                void visitComponent(route.components.get(childComponentId)));
        };

        visitComponent(route.components.get(rootComponentId));
    });

export const getRouteByComponentId = (project, componentId) =>
    project.routes.find(route => route.components.has(componentId));

export const getComponentById = (project, componentId) =>
    getRouteByComponentId(project, componentId).components.get(componentId);

export default ProjectRecord;
