/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map } from 'immutable';
import { projectComponentToImmutable } from './ProjectComponent';
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
  haveRedirect: false,
  redirectTo: '',
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
  indexComponent: input.indexComponent !== null
    ? input.indexComponent.id
    : INVALID_ID,
  
  haveRedirect: input.haveRedirect,
  redirectTo: input.redirectTo,
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

    if (input.component !== null)
      visitComponent(input.component, false);
    
    if (input.indexComponent !== null)
      visitComponent(input.indexComponent, true);
  }),
});

export const getMaxComponentId = route =>
  route.components.size > 0
    ? route.components.keySeq().max()
    : INVALID_ID;

export const getOutletComponentId = route =>
  route.components.findKey(component => component.name === 'Outlet') ||
  INVALID_ID;

export const getParentComponentId = (route, componentId) =>
  route.components.get(componentId).parentId;

export default ProjectRouteRecord;
