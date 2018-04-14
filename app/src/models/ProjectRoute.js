import { Record, List, Map } from 'immutable';

import {
  projectComponentToImmutable,
  projectComponentToJSv1,
} from './ProjectComponent';

import { mapListToArray } from '../utils/misc';
import { INVALID_ID } from '../constants/misc';

const ProjectRouteRecord = Record({
  id: INVALID_ID,
  parentId: INVALID_ID,
  path: '',
  fullPath: '',
  title: '',
  description: '',
  component: INVALID_ID,
  haveIndex: false,
  indexRouteDescription: '',
  indexComponent: INVALID_ID,
  redirect: false,
  redirectTo: '',
  redirectAuthenticated: false,
  redirectAuthenticatedTo: '',
  redirectAnonymous: false,
  redirectAnonymousTo: '',
  paramValues: Map(),
  children: List(),
  components: Map(),
});

const VALID_PATH_STEPS = new Set(['components']);

ProjectRouteRecord.isValidPathStep = step => VALID_PATH_STEPS.has(step);
ProjectRouteRecord.expandPathStep = step => [step];

export const projectRouteToImmutable = (
  input,
  fullPath,
  parentId,
) => new ProjectRouteRecord({
  id: input.id,
  parentId,
  path: input.path,
  fullPath,
  title: input.title,
  description: input.description,
  haveIndex: input.haveIndex,
  indexRouteDescription: input.indexRouteDescription,
  indexComponent: input.indexComponent !== null
    ? input.indexComponent.id
    : INVALID_ID,
  
  redirect: input.redirect,
  redirectTo: input.redirectTo,
  redirectAuthenticated: input.redirectAuthenticated,
  redirectAuthenticatedTo: input.redirectAuthenticatedTo,
  redirectAnonymous: input.redirectAnonymous,
  redirectAnonymousTo: input.redirectAnonymousTo,
  paramValues: Map(input.paramValues),
  component: input.component !== null
    ? input.component.id
    : INVALID_ID,
  
  children: List(input.children.map(childRoute => childRoute.id)),
  components: Map().withMutations(components => {
    const visitComponent = (component, isIndexRoute, parentId = INVALID_ID) => {
      components.set(
        component.id,
        projectComponentToImmutable(
          component,
          input.id,
          isIndexRoute,
          parentId,
        ),
      );

      component.children.forEach(childComponent =>
        visitComponent(childComponent, isIndexRoute, component.id));
    };

    if (input.component !== null) {
      visitComponent(input.component, false);
    }
    
    if (input.indexComponent !== null) {
      visitComponent(input.indexComponent, true);
    }
  }),
});

export const getMaxComponentId = route =>
  route.components.size > 0
    ? route.components.keySeq().max()
    : INVALID_ID;

const getParentRoute = (route, routes) => route.parentId === INVALID_ID
  ? null
  : routes.get(route.parentId);

export const getRouteParams = (route, routes) => {
  const ret = {};
  
  while (route !== null) {
    route.paramValues.forEach((value, name) => {
      ret[name] = value;
    });
    
    route = getParentRoute(route, routes);
  }
  
  return ret;
};

export const projectRouteToJSv1 = (routes, routeId) => {
  const route = routes.get(routeId);
  
  return {
    id: route.id,
    path: route.path,
    title: route.title,
    description: route.description,
    haveIndex: route.haveIndex,
    indexRouteDescription: route.indexRouteDescription,
    indexComponent: route.indexComponent === INVALID_ID
      ? null
      : projectComponentToJSv1(route.components, route.indexComponent),
    redirect: route.redirect,
    redirectTo: route.redirectTo,
    redirectAuthenticated: route.redirectAuthenticated,
    redirectAuthenticatedTo: route.redirectAuthenticatedTo,
    redirectAnonymous: route.redirectAnonymous,
    redirectAnonymousTo: route.redirectAnonymousTo,
    paramValues: route.paramValues.toJS(),
    component: route.component === INVALID_ID
      ? null
      : projectComponentToJSv1(route.components, route.component),
    children: mapListToArray(
      route.children,
      childId => projectRouteToJSv1(routes, childId),
    ),
  };
};

export default ProjectRouteRecord;
