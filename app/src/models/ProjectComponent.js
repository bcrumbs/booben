/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map, Set } from 'immutable';
import _mapValues from 'lodash.mapvalues';
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

import { INVALID_ID } from '../constants/misc';

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
  const: sourceData => ({
    value: sourceData.value,
  }),
  
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
