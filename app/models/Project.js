/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map, Set } from 'immutable';
import _forOwn from 'lodash.forown';

import {
    projectRouteToImmutable,
    getMaxComponentId as _getMaxComponentId,
} from './ProjectRoute';

import { projectFunctionToImmutable } from './ProjectFunction';

import { concatPath } from '../utils';

const ProjectRecord = Record({
  name: '',
  author: '',
  componentLibs: List(),
  graphQLEndpointURL: null,
  routes: Map(),
  rootRoutes: List(),
  functions: Map(),
});

export const projectToImmutable = input => new ProjectRecord({
  name: input.name,
  author: input.author,
  componentLibs: List(input.componentLibs),
  graphQLEndpointURL: input.graphQLEndpointURL || '',
  routes: Map().withMutations(routes => {
    const visitRoute = (route, pathPrefix, parentRouteId) => {
      const fullPath = concatPath(pathPrefix, route.path);
      routes.set(route.id, projectRouteToImmutable(route, fullPath, parentRouteId));

      route.children.forEach(childRoute =>
                visitRoute(childRoute, fullPath, route.id));
    };

    input.routes.forEach(route => visitRoute(route, '', -1));
  }),

  rootRoutes: List(input.routes.map(route => route.id)),

  functions: Map().withMutations(fns => {
    _forOwn(input.functions, (fn, name) => {
      fns.set(name, projectFunctionToImmutable(fn));
    });
  }),
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

export default ProjectRecord;
