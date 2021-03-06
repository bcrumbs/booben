import { Record, List, Map, Set } from 'immutable';
import _forOwn from 'lodash.forown';

import {
  projectRouteToImmutable,
  projectRouteToJSv1,
  getMaxComponentId as _getMaxComponentId,
} from './ProjectRoute';

import {
  projectFunctionToImmutable,
  projectFunctionToJSv1,
} from './ProjectFunction';

import {
  concatPath,
  mapMapToObject,
  mapListToArray,
  returnSecondArg,
} from '../utils/misc';

import { INVALID_ID } from '../constants/misc';

const AuthParamRecord = Record({
  value: '',
  argument: '',
  path: [],
});

const AuthRecord = Record({
  type: '',
  loginMutation: '',
  tokenPath: [],
  username: null,
  password: null,
});

const authToImmutable = input => new AuthRecord({
  ...input,
  username: input.username ? new AuthParamRecord(input.username) : null,
  password: input.password ? new AuthParamRecord(input.password) : null,
});

const ProjectRecord = Record({
  _id: '',
  name: '',
  author: '',
  componentLibs: List(),
  enableHTML: false,
  graphQLEndpointURL: '',
  proxyGraphQLEndpoint: false,
  auth: null,
  routes: Map(),
  rootRoutes: List(),
  functions: Map(),
});

const VALID_PATH_STEPS = new Set(['routes']);

ProjectRecord.isValidPathStep = step => VALID_PATH_STEPS.has(step);
ProjectRecord.expandPathStep = step => step;

export const projectToImmutable = input => new ProjectRecord({
  _id: input._id,
  name: input.name,
  author: input.author,
  componentLibs: List(input.componentLibs),
  enableHTML: input.enableHTML,
  graphQLEndpointURL: input.graphQLEndpointURL,
  proxyGraphQLEndpoint: input.proxyGraphQLEndpoint,
  auth: input.auth ? authToImmutable(input.auth) : null,
  routes: Map().withMutations(routes => {
    const visitRoute = (route, pathPrefix, parentRouteId = INVALID_ID) => {
      const fullPath = concatPath(pathPrefix, route.path);
      
      routes.set(
        route.id,
        projectRouteToImmutable(route, fullPath, parentRouteId),
      );

      route.children.forEach(childRoute =>
        visitRoute(childRoute, fullPath, route.id));
    };

    input.routes.forEach(route => visitRoute(route, ''));
  }),

  rootRoutes: List(input.routes.map(route => route.id)),
  functions: Map().withMutations(fns => {
    _forOwn(input.functions, (fn, name) => {
      fns.set(name, projectFunctionToImmutable(fn));
    });
  }),
});

export const getMaxRouteId = project => project.routes.size > 0
  ? project.routes.keySeq().max()
  : INVALID_ID;

export const getMaxComponentId = project =>
  Math.max(INVALID_ID, ...project.routes.toList().map(_getMaxComponentId));

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

export const getComponentById = (project, componentId) => {
  const route = getRouteByComponentId(project, componentId);
  return route && route.components.get(componentId);
};

export const projectToJSv1 = project => ({
  _id: project._id,
  version: 1,
  name: project.name,
  author: project.author,
  componentLibs: project.componentLibs.toJS(),
  enableHTML: project.enableHTML,
  graphQLEndpointURL: project.graphQLEndpointURL,
  proxyGraphQLEndpoint: project.proxyGraphQLEndpoint,
  auth: project.auth === null ? null : project.auth.toJS(),
  routes: mapListToArray(
    project.rootRoutes,
    routeId => projectRouteToJSv1(project.routes, routeId),
  ),
  functions: mapMapToObject(
    project.functions,
    returnSecondArg,
    projectFunctionToJSv1,
  ),
});

export default ProjectRecord;
