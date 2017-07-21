/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Set, Map } from 'immutable';
import _forOwn from 'lodash.forown';
import { TypeNames } from '@jssy/types';

import {
  getComponentMeta,
  parseComponentName,
  formatComponentName,
} from './meta';

import { getMutationField, getJssyValueDefOfMutationArgument } from './schema';
import { getFunctionInfo } from './functions';
import { mapListToArray } from '../utils/misc';

import {
  SYSTEM_PROPS,
  ROUTE_PARAM_VALUE_DEF,
  INVALID_ID,
} from '../constants/misc';

/**
 *
 * @param {string} componentName
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const canInsertRootComponent = (componentName, meta) => {
  const componentMeta = getComponentMeta(componentName, meta);
  return !componentMeta.placement || componentMeta.placement.root !== 'deny';
};

/**
 *
 * @type {number}
 */
export const ANYWHERE = -2;

/**
 *
 * @param {string} componentName
 * @param {Immutable.Map<number, Object>} components
 * @param {number} containerId
 * @param {number} afterIdx - -1 = before first child; ANYWHERE = well, anywhere :)
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const canInsertComponent = (
  componentName,
  components,
  containerId,
  afterIdx,
  meta,
) => {
  const componentMeta = getComponentMeta(componentName, meta);
  
  const mustBeRoot =
    !!componentMeta.placement &&
    componentMeta.placement.root === 'only';
  
  if (mustBeRoot) return false;
  
  const container = components.get(containerId);
  const containerMeta = getComponentMeta(container.name, meta);
  if (containerMeta.kind !== 'container') return false;
  
  if (!componentMeta.placement) return true;
  
  const { namespace } = parseComponentName(componentName);
  const { namespace: containerNamespace } = parseComponentName(container.name);
  const sameNamespace = containerNamespace === namespace;
  
  if (sameNamespace && componentMeta.placement.inside) {
    if (componentMeta.placement.inside.include) {
      const containerChildrenNames = mapListToArray(
        container.children,
        childId => components.get(childId).name,
      );
      
      const sameComponentsNum = containerChildrenNames
        .reduce((acc, cur) => acc + (cur === componentName ? 1 : 0), 0);
      
      const allow = componentMeta.placement.inside.include.some(inclusion => {
        if (inclusion.component) {
          const inclusionComponentName = formatComponentName(
            namespace,
            inclusion.component,
          );
          
          if (container.name !== inclusionComponentName) return false;
        } else if (inclusion.group) {
          if (containerMeta.group !== inclusion.group) return false;
        } else if (inclusion.tag) {
          if (!containerMeta.tags.has(inclusion.tag)) return false;
        }
        
        return !inclusion.maxNum || sameComponentsNum < inclusion.maxNum;
      });
      
      if (!allow) return false;
    }
    
    if (componentMeta.placement.inside.exclude) {
      const deny = componentMeta.placement.inside.exclude.some(exclusion => {
        if (exclusion.component) {
          const exclusionComponentName = formatComponentName(
            namespace,
            exclusion.component,
          );
          
          return container.name === exclusionComponentName;
        } else if (exclusion.group) {
          return containerMeta.group === exclusion.group;
        } else if (exclusion.tag) {
          return containerMeta.tags.has(exclusion.tag);
        } else {
          return false;
        }
      });
      
      if (deny) return false;
    }
  }
  
  // TODO: Check before and after constraints
  
  return true;
};

/**
 *
 * @param {string} componentName
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootId
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const canInsertComponentIntoTree = (
  componentName,
  components,
  rootId,
  meta,
) => {
  const rootComponent = components.get(rootId);
  
  const canInsert = canInsertComponent(
    componentName,
    components,
    rootId,
    ANYWHERE,
    meta,
  );
  
  if (canInsert) return true;
  
  return rootComponent.children.some(childId => canInsertComponentIntoTree(
    componentName,
    components,
    childId,
    meta,
  ));
};

/**
 *
 * @param {Object} component
 * @return {boolean}
 */
export const isRootComponent = component => component.parentId === INVALID_ID;

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} componentId
 * @param {number} containerId
 * @return {boolean}
 */
export const isDeepChild = (components, componentId, containerId) => {
  const component = components.get(componentId);
  
  let parentId = component.parentId;
  while (parentId !== INVALID_ID) {
    if (parentId === containerId) return true;
    parentId = components.get(parentId).parentId;
  }
  
  return false;
};

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} componentId
 * @param {number} containerId
 * @param {number} afterIdx
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const canMoveComponent = (
  components,
  componentId,
  containerId,
  afterIdx,
  meta,
) =>
  componentId !== containerId &&
  !isDeepChild(components, containerId, componentId) &&
  canInsertComponent(
    components.get(componentId).name,
    components,
    containerId,
    afterIdx,
    meta,
  );

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootComponentId
 * @param {function(component: Object)} visitor
 */
export const walkComponentsTree = (components, rootComponentId, visitor) => {
  const component = components.get(rootComponentId);
  visitor(component);

  component.children.forEach(childId => {
    walkComponentsTree(components, childId, visitor);
  });
};

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootComponentId
 * @param {function(component: Object): boolean} predicate
 */
export const findComponent = (components, rootComponentId, predicate) => {
  if (rootComponentId === INVALID_ID) return null;

  const component = components.get(rootComponentId);

  if (predicate(component)) {
    return component;
  } else {
    let found = null;

    component.children.forEach(id => {
      found = findComponent(components, id, predicate);
      return found === null;
    });

    return found;
  }
};

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootComponentId
 * @return {Immutable.Set<number>}
 */
export const gatherComponentsTreeIds = (
  components,
  rootComponentId,
) => Set().withMutations(ret => void walkComponentsTree(
  components,
  rootComponentId,
  component => void ret.add(component.id),
));

/**
 *
 * @param {Object} component
 * @param {function(id: number): number} transformId
 * @param {boolean} isRoot
 */
const makeDetachedCopyOfComponent = (
  component,
  transformId,
  isRoot,
) => component.merge({
  id: transformId(component.id),
  parentId: isRoot ? INVALID_ID : transformId(component.parentId),
  isNew: true,
  routeId: INVALID_ID,
  isIndexRoute: false,
  children: component.children.map(transformId),
});

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootId
 * @return {Immutable.Map<number, Object>}
 */
export const makeDetachedCopy = (
  components,
  rootId,
) => Map().withMutations(ret => {
  let idsMap = Map();
  let nextId = 0;

  const transformId = id => {
    if (idsMap.has(id)) {
      return idsMap.get(id);
    } else {
      const newId = nextId++;
      idsMap = idsMap.set(id, newId);
      return newId;
    }
  };

  walkComponentsTree(components, rootId, component => {
    const isRoot = component.id === rootId;
    const detachedCopy = makeDetachedCopyOfComponent(
      component,
      transformId,
      isRoot,
    );

    ret.set(detachedCopy.id, detachedCopy);
  });
});

/**
 *
 * @param {Object} component
 * @param {ComponentMeta} componentMeta
 * @param {function(jssyValue: Object, valueDef: JssyValueDefinition, steps: (string|number)[], isSystemProp: boolean )} visitor
 * @param {boolean} [walkSystemProps=false]
 * @param {boolean} [walkDesignerValues=false]
 * @param {?Object<string, Object<string, ComponentMeta>>} [meta=null]
 * @param {boolean} [walkFunctionArgs=false]
 * @param {?Object} [project=null]
 * @param {boolean} [walkActions=false]
 * @param {?Object} [schema=null]
 * @param {boolean} [visitIntermediateNodes=false]
 * @param {(string|number)[]} [_pathPrefix=[]]
 */
export const walkSimpleValues = (
  component,
  componentMeta,
  visitor,
  {
    walkSystemProps = false,
    walkDesignerValues = false,
    meta = null,
    walkFunctionArgs = false,
    project = null,
    walkActions = false,
    schema = null,
    visitIntermediateNodes = false,
  } = {},
  _pathPrefix = [],
) => {
  if (walkFunctionArgs && !project) {
    throw new Error(
      'walkSimpleProps(): walkFunctionArgs is true, but there\'s no project',
    );
  }

  if (walkActions && !schema) {
    throw new Error(
      'walkSimpleProps(): walkActions is true, but there\'s no schema',
    );
  }

  if (walkDesignerValues && !meta) {
    throw new Error(
      'walkSimpleProps(): walkDesignerValues is true, but there\'s no meta',
    );
  }

  const options = {
    walkSystemProps,
    walkDesignerValues,
    meta,
    walkFunctionArgs,
    project,
    walkActions,
    schema,
    visitIntermediateNodes,
  };

  /* eslint-disable no-use-before-define */
  const visitAction = (action, path, isSystemProp) => {
    if (action.type === 'mutation') {
      const mutationField =
        getMutationField(schema, action.params.mutation);

      action.params.args.forEach((argValue, argName) => {
        const argValueDef = getJssyValueDefOfMutationArgument(
          mutationField.args[argName],
          schema,
        );

        visitValue(
          argValue,
          argValueDef,
          [...path, 'args', argName],
          isSystemProp,
        );
      });

      action.params.successActions.forEach((action, actionIdx) => {
        visitAction(
          action,
          [...path, 'successActions', actionIdx],
          isSystemProp,
        );
      });

      action.params.errorActions.forEach((action, actionIdx) => {
        visitAction(
          action,
          [...path, 'errorActions', actionIdx],
          isSystemProp,
        );
      });
    } else if (action.type === 'method') {
      const methodMeta = componentMeta.methods[action.para.method];

      action.params.args.forEach((argValue, argIdx) => {
        const argValueDef = methodMeta.args[argIdx];

        visitValue(
          argValue,
          argValueDef,
          [...path, 'args', argIdx],
          isSystemProp,
        );
      });
    } else if (action.type === 'navigate') {
      action.params.routeParams.forEach((paramValue, paramName) => {
        visitValue(
          paramValue,
          ROUTE_PARAM_VALUE_DEF,
          [...path, 'routeParams', paramName],
          isSystemProp,
        );
      });
    } else if (action.type === 'prop') {
      // TODO: Visit value
    }
  };

  const visitValue = (jssyValue, valueDef, path, isSystemProp) => {
    if (jssyValue.source === 'static' && !jssyValue.sourceData.ownerPropName) {
      if (
        valueDef.type === TypeNames.SHAPE &&
        jssyValue.sourceData.value !== null
      ) {
        _forOwn(valueDef.fields, (fieldTypedef, fieldName) => {
          const fieldValue = jssyValue.sourceData.value.get(fieldName);

          if (fieldValue) {
            visitValue(
              fieldValue,
              fieldTypedef,
              [...path, fieldName],
              isSystemProp,
            );
          }
        });
      } else if (
        valueDef.type === TypeNames.OBJECT_OF &&
        jssyValue.sourceData.value !== null
      ) {
        jssyValue.sourceData.value.forEach((fieldValue, key) => void visitValue(
          fieldValue,
          valueDef.ofType,
          [...path, key],
          isSystemProp,
        ));
      } else if (valueDef.type === TypeNames.ARRAY_OF) {
        jssyValue.sourceData.value.forEach((itemValue, idx) => void visitValue(
          itemValue,
          valueDef.ofType,
          [...path, idx],
          isSystemProp,
        ));
      } else {
        visitor(jssyValue, valueDef, path, isSystemProp);
      }
    } else if (walkFunctionArgs && jssyValue.source === 'function') {
      if (visitIntermediateNodes) {
        visitor(jssyValue, valueDef, path, isSystemProp);
      }

      const fnInfo = getFunctionInfo(
        jssyValue.sourceData.functionSource,
        jssyValue.sourceData.function,
        project.functions,
      );

      fnInfo.args.forEach(argInfo => {
        const argName = argInfo.name;
        const argValue = jssyValue.sourceData.args.get(argInfo.name);

        if (argValue) {
          visitValue(
            argValue,
            argInfo.typedef,
            [...path, 'args', argName],
            isSystemProp,
          );
        }
      });
    } else if (walkActions && jssyValue.source === 'actions') {
      if (visitIntermediateNodes) {
        visitor(jssyValue, valueDef, path, isSystemProp);
      }

      jssyValue.sourceData.actions.forEach((action, actionIdx) => {
        visitAction(action, [...path, 'actions', actionIdx], isSystemProp);
      });
    } else if (walkDesignerValues && jssyValue.sourceIs('designer')) {
      if (visitIntermediateNodes) {
        visitor(jssyValue, valueDef, path, isSystemProp);
      }

      const components = jssyValue.sourceData.components;
      const rootId = jssyValue.sourceData.rootId;

      if (rootId !== INVALID_ID) {
        walkComponentsTree(components, rootId, component => {
          const componentMeta = getComponentMeta(component.name, meta);
          const pathPrefix = [...path, 'components', component.id];

          walkSimpleValues(
            component,
            componentMeta,
            visitor,
            options,
            pathPrefix,
          );
        });
      }
    } else {
      visitor(jssyValue, valueDef, path, isSystemProp);
    }
  };
  /* eslint-enable no-use-before-define */

  component.props.forEach(
    (propValue, propName) => visitValue(
      propValue,
      componentMeta.props[propName],
      [..._pathPrefix, 'props', propName],
    ),
  );

  if (walkSystemProps) {
    component.systemProps.forEach(
      (propValue, propName) => visitValue(
        propValue,
        SYSTEM_PROPS[propName],
        [..._pathPrefix, 'systemProps', propName],
      ),
    );
  }
};
