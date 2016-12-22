/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map } from 'immutable';

import { projectComponentToImmutable } from './ProjectComponent';

const ProjectRouteRecord = Record({
  id: 0,
  parentId: -1,
  path: '',
  fullPath: '',
  title: '',
  description: '',
  haveIndex: false,
  indexRouteDescription: '',
  indexComponent: -1,
  haveRedirect: false,
  redirectTo: '',
  component: -1,
  children: List(),
  components: Map(),
});

export const projectRouteToImmutable = (input, fullPath, parentId) => new ProjectRouteRecord({
  id: input.id,
  parentId,
  path: input.path,
  fullPath,
  title: input.title,
  description: input.description,
  haveIndex: input.haveIndex,
  indexComponent: input.indexComponent !== null ? input.indexComponent.id : -1,
  haveRedirect: input.haveRedirect,
  redirectTo: input.redirectTo,
  component: input.component !== null ? input.component.id : -1,
  children: List(input.children.map(childRoute => childRoute.id)),
  components: Map().withMutations(components => {
    const visitComponent = (component, isIndexRoute, parentId) => {
      components.set(
                component.id,
                projectComponentToImmutable(component, input.id, isIndexRoute, parentId),
            );

      component.children.forEach(childComponent =>
                visitComponent(childComponent, isIndexRoute, component.id));
    };

    if (input.component !== null) visitComponent(input.component, false, -1);
    if (input.indexComponent !== null) visitComponent(input.indexComponent, true, -1);
  }),
});

export const getMaxComponentId = route =>
    route.components.size > 0 ? route.components.keySeq().max() : -1;

export const getOutletComponentId = route =>
    route.components.findKey(component => component.name === 'Outlet') || -1;

export const getParentComponentId = (route, componentId) =>
    route.components.get(componentId).parentId;

export const isRootRoute = route => route.parentId === -1;

export default ProjectRouteRecord;
