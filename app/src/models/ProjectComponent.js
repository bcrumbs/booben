/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map, Set } from 'immutable';
import _forOwn from 'lodash.forown';
import _mapValues from 'lodash.mapvalues';
import { TypeNames } from '@jssy/types';
import JssyValue from './JssyValue';
import SourceDataStatic from './SourceDataStatic';
import SourceDataData, { QueryPathStep } from './SourceDataData';
import SourceDataConst from './SourceDataConst';
import SourceDataFunction from './SourceDataFunction';

import SourceDataActions, {
  Action,
  MutationActionParams,
  NavigateActionParams,
  URLActionParams,
  MethodCallActionParams,
  PropChangeActionParams,
  AJAXActionParams,
} from './SourceDataActions';

import SourceDataDesigner from './SourceDataDesigner';
import SourceDataState from './SourceDataState';
import SourceDataRouteParams from './SourceDataRouteParams';
import SourceDataActionArg from './SourceDataActionArg';
import { getFunctionInfo } from '../lib/functions';

import {
  getMutationField,
  getJssyValueDefOfMutationArgument,
} from '../lib/schema';

import { getComponentMeta } from '../lib/meta';

import {
  isUndef,
  isObject,
  isNumber,
  mapListToArray,
  mapMapToObject,
  returnArg,
  returnSecondArg,
  returnNull,
} from '../utils/misc';

import {
  INVALID_ID,
  SYSTEM_PROPS,
  ROUTE_PARAM_VALUE_DEF,
} from '../constants/misc';

const ProjectComponentRecord = Record({
  id: INVALID_ID,
  parentId: INVALID_ID,
  isNew: false,
  isWrapper: false,
  name: '',
  title: '',
  props: Map(),
  systemProps: Map(),
  children: List(),
  layout: 0,
  regionsEnabled: Set(),
  routeId: INVALID_ID,
  isIndexRoute: false,
});

const VALID_PATH_STEPS = new Set(['props', 'systemProps']);

ProjectComponentRecord.isValidPathStep = step => VALID_PATH_STEPS.has(step);
ProjectComponentRecord.expandPathStep = step => [step];


/* eslint-disable no-use-before-define */
const actionsToImmutable = actions => List(actions.map(action => {
  const data = {
    type: action.type,
  };
  
  switch (action.type) {
    case 'mutation': {
      data.params = new MutationActionParams({
        mutation: action.params.mutation,
        args: Map(_mapValues(action.params.args, jssyValueToImmutable)),
        successActions: actionsToImmutable(action.params.successActions),
        errorActions: actionsToImmutable(action.params.errorActions),
      });
      
      break;
    }
    
    case 'navigate': {
      data.params = new NavigateActionParams({
        routeId: action.params.routeId,
        routeParams: Map(_mapValues(
          action.params.routeParams,
          jssyValueToImmutable,
        )),
      });
      
      break;
    }
    
    case 'url': {
      data.params = new URLActionParams({
        url: action.params.url,
        newWindow: action.params.newWindow,
      });
      
      break;
    }
    
    case 'method': {
      data.params = new MethodCallActionParams({
        componentId: action.params.componentId,
        method: action.params.method,
        args: List(action.params.args.map(jssyValueToImmutable)),
      });
      
      break;
    }
    
    case 'prop': {
      data.params = new PropChangeActionParams({
        componentId: action.params.componentId,
        propName: action.params.propName || '',
        systemPropName: action.params.systemPropName || '',
        value: jssyValueToImmutable(action.params.value),
      });
      
      break;
    }
    
    case 'ajax': {
      data.params = new AJAXActionParams({
        url: jssyValueToImmutable(action.params.url),
        method: action.params.method,
        headers: Map(action.params.headers),
        body: action.params.body === null
          ? null
          : jssyValueToImmutable(action.params.body),
        mode: action.params.mode,
        decodeResponse: action.params.decodeResponse,
        successActions: actionsToImmutable(action.params.successActions),
        errorActions: actionsToImmutable(action.params.errorActions),
      });
      
      break;
    }
    
    default: {
      data.params = null;
    }
  }
  
  return Action(data);
}));

export const jssyValueToImmutable = ({ source, sourceData }) => new JssyValue({
  source,
  sourceData: sourceDataToImmutable(source, sourceData),
});

const propSourceDataToImmutableFns = {
  const: input => new SourceDataConst(input),
  static: input => {
    const data = {};

    if (!isUndef(input.value)) {
      if (Array.isArray(input.value)) {
        data.value = List(input.value.map(jssyValueToImmutable),
        );
      } else if (isObject(input.value)) {
        data.value = Map(_mapValues(input.value, jssyValueToImmutable));
      } else {
        data.value = input.value;
      }
    }

    if (!isUndef(input.ownerPropName)) {
      data.ownerPropName = input.ownerPropName;
    }

    return new SourceDataStatic(data);
  },

  data: input => {
    const data = {
      queryPath: input.queryPath
        ? List(input.queryPath.map(step => new QueryPathStep({
          field: step.field,
        })))
        : null,
      
      queryArgs: Map(_mapValues(input.queryArgs, args =>
        Map(_mapValues(args, jssyValueToImmutable)))),

      dataContext: input.dataContext
        ? List(input.dataContext)
        : List(),
    };

    return new SourceDataData(data);
  },

  function: input => new SourceDataFunction({
    functionSource: input.functionSource,
    function: input.function,
    args: Map(_mapValues(input.args, jssyValueToImmutable)),
  }),
  
  actions: input => new SourceDataActions({
    actions: actionsToImmutable(input.actions),
  }),

  designer: input => new SourceDataDesigner(
    input.component
      ? {
        rootId: input.component.id,
        components: componentsToImmutable(
          input.component,
          INVALID_ID,
          false,
          INVALID_ID,
        ),
      }

      : {
        rootId: INVALID_ID,
      },
  ),
  
  state: input => new SourceDataState(input),
  routeParams: input => new SourceDataRouteParams(input),
  actionArg: input => new SourceDataActionArg(input),
};
/* eslint-enable no-use-before-define */

export const sourceDataToImmutable = (source, sourceData) =>
  propSourceDataToImmutableFns[source](sourceData);

const propsToImmutable = props => Map(_mapValues(props, jssyValueToImmutable));

export const projectComponentToImmutable = (
  input,
  routeId,
  isIndexRoute,
  parentId,
) => new ProjectComponentRecord({
  id: input.id,
  parentId,
  isNew: !!input.isNew,
  isWrapper: !!input.isWrapper,
  name: input.name,
  title: input.title,
  props: propsToImmutable(input.props),
  systemProps: propsToImmutable(input.systemProps),
  children: List(input.children.map(childComponent => childComponent.id)),
  layout: isNumber(input.layout) ? input.layout : 0,
  regionsEnabled: input.regionsEnabled ? Set(input.regionsEnabled) : Set(),
  routeId,
  isIndexRoute,
});

export const componentsToImmutable = (
  input,
  routeId,
  isIndexRoute,
  parentId,
) => Map().withMutations(mut => {
  const visitComponent = (component, parentId) => {
    mut.set(
      component.id,
      projectComponentToImmutable(component, routeId, isIndexRoute, parentId),
    );

    component.children.forEach(childComponent =>
      void visitComponent(childComponent, component.id));
  };

  visitComponent(input, parentId);
});

export const isRootComponent = component => component.parentId === INVALID_ID;

export const walkComponentsTree = (components, rootComponentId, visitor) => {
  const component = components.get(rootComponentId);
  visitor(component);

  component.children.forEach(childId => {
    walkComponentsTree(components, childId, visitor);
  });
};

export const gatherComponentsTreeIds = (components, rootComponentId) =>
  Set().withMutations(ret => void walkComponentsTree(
    components,
    rootComponentId,
    component => void ret.add(component.id),
  ));

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
        project,
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

/* eslint-disable no-use-before-define */
const actionParamsToJSv1Converters = {
  mutation: params => ({
    mutation: params.mutation,
    args: mapMapToObject(params.args, returnSecondArg, jssyValueToJSv1),
    successActions: mapListToArray(params.successActions, actionToJSv1),
    errorActions: mapListToArray(params.errorActions, actionToJSv1),
  }),
  
  method: params => ({
    componentId: params.componentId,
    method: params.method,
    args: mapListToArray(params.args, jssyValueToJSv1),
  }),
  
  prop: params => {
    const ret = {
      componentId: params.componentId,
      value: jssyValueToJSv1(params.value),
    };
    
    if (params.systemPropName) {
      ret.systemPropName = params.systemPropName;
    } else {
      ret.propName = params.propName;
    }
    
    return ret;
  },
  
  navigate: params => ({
    routeId: params.routeId,
    routeParams: mapMapToObject(
      params.routeParams,
      returnSecondArg,
      jssyValueToJSv1,
    ),
  }),
  
  url: params => params.toJS(),
  
  logout: returnNull,
  
  ajax: params => ({
    url: jssyValueToJSv1(params.url),
    method: params.method,
    headers: params.headers.toJS(),
    body: params.body === null ? null : jssyValueToJSv1(params.body),
    mode: params.mode,
    decodeResponse: params.decodeResponse,
    successActions: mapListToArray(params.successActions, actionToJSv1),
    errorActions: mapListToArray(params.errorActions, actionToJSv1),
  }),
};

const actionToJSv1 = action => ({
  type: action.type,
  params: actionParamsToJSv1Converters[action.type](action.params),
});

const sourceDataToJSv1Converters = {
  const: sourceData => {
    if (sourceData.jssyConstId) {
      return {
        jssyConstId: sourceData.jssyConstId,
      };
    } else {
      return {
        value: sourceData.value,
      };
    }
  },
  
  static: sourceData => {
    if (sourceData.ownerPropName) {
      return {
        ownerPropName: sourceData.ownerPropName,
      };
    } else if (sourceData.value instanceof List) {
      return {
        value: mapListToArray(sourceData.value, jssyValueToJSv1),
      };
    } else if (sourceData.value instanceof Map) {
      return {
        value: mapMapToObject(
          sourceData.value,
          returnSecondArg,
          jssyValueToJSv1,
        ),
      };
    } else {
      return {
        value: sourceData.value,
      };
    }
  },
  
  data: sourceData => ({
    dataContext: mapListToArray(sourceData, returnArg),
    queryPath: mapListToArray(sourceData.queryPath, step => step.toJS()),
    queryArgs: mapMapToObject(
      sourceData.queryArgs,
      returnSecondArg,
      args => mapMapToObject(args, returnSecondArg, jssyValueToJSv1),
    ),
  }),
  
  function: sourceData => ({
    functionSource: sourceData.functionSource,
    function: sourceData.function,
    args: mapMapToObject(sourceData.args, returnSecondArg, jssyValueToJSv1),
  }),
  
  actions: sourceData => ({
    actions: mapListToArray(sourceData.actions, actionToJSv1),
  }),
  
  designer: sourceData => {
    if (sourceData.rootId === INVALID_ID) {
      return {
        component: null,
      };
    } else {
      return {
        component: projectComponentToJSv1(
          sourceData.components,
          sourceData.rootId,
        ),
      };
    }
  },
  
  state: sourceData => sourceData.toJS(),
  routeParams: sourceData => sourceData.toJS(),
  actionArg: sourceData => sourceData.toJS(),
};
/* eslint-enable no-use-before-define */

const sourceDataToJSv1 = (source, sourceData) =>
  sourceDataToJSv1Converters[source](sourceData);

const jssyValueToJSv1 = jssyValue => ({
  source: jssyValue.source,
  sourceData: sourceDataToJSv1(jssyValue.source, jssyValue.sourceData),
});

export const projectComponentToJSv1 = (components, componentId) => {
  const component = components.get(componentId);
  
  return {
    id: component.id,
    name: component.name,
    title: component.title,
    isWrapper: component.isWrapper,
    props: mapMapToObject(
      component.props,
      returnSecondArg,
      jssyValueToJSv1,
    ),
    systemProps: mapMapToObject(
      component.systemProps,
      returnSecondArg,
      jssyValueToJSv1,
    ),
    layout: component.layout,
    regionsEnabled: component.regionsEnabled,
    children: mapListToArray(
      component.children,
      childId => projectComponentToJSv1(components, childId),
    ),
  };
};

export default ProjectComponentRecord;
