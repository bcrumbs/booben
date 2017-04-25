/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map, Set } from 'immutable';
import _forOwn from 'lodash.forown';
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
} from './SourceDataActions';

import SourceDataDesigner from './SourceDataDesigner';
import SourceDataState from './SourceDataState';
import SourceDataRouteParams from './SourceDataRouteParams';
import { getFunctionInfo } from '../utils/functions';
import { getMutationField, getJssyTypeOfField } from '../utils/schema';
import { isUndef, isObject, isNumber } from '../utils/misc';

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

    if (!isUndef(input.ownerPropName))
      data.ownerPropName = input.ownerPropName;

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

  const: input => new SourceDataConst(input),
  
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

  component.children.forEach(childId =>
    void walkComponentsTree(components, childId, visitor));
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
    walkFunctionArgs = false,
    project = null,
    walkActions = false,
    schema = null,
    visitIntermediateNodes = false,
  } = {},
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
  
  /* eslint-disable no-use-before-define */
  const visitAction = (action, path, isSystemProp) => {
    if (action.type === 'mutation') {
      const mutationField =
        getMutationField(schema, action.params.mutation);
      
      action.params.args.forEach((argValue, argName) => {
        const argValueDef = getJssyTypeOfField(
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
      if (valueDef.type === 'shape' && jssyValue.sourceData.value !== null) {
        _forOwn(valueDef.fields, (fieldTypedef, fieldName) =>
          void visitValue(
            jssyValue.sourceData.value.get(fieldName),
            fieldTypedef,
            [...path, fieldName],
            isSystemProp,
          ));
      } else if (
        valueDef.type === 'objectOf' &&
        jssyValue.sourceData.value !== null
      ) {
        jssyValue.sourceData.value.forEach((fieldValue, key) => void visitValue(
          fieldValue,
          valueDef.ofType,
          [...path, key],
          isSystemProp,
        ));
      } else if (valueDef.type === 'arrayOf') {
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
      if (visitIntermediateNodes)
        visitor(jssyValue, valueDef, path, isSystemProp);
      
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
      if (visitIntermediateNodes)
        visitor(jssyValue, valueDef, path, isSystemProp);
      
      jssyValue.sourceData.actions.forEach((action, actionIdx) => {
        visitAction(action, [...path, 'actions', actionIdx], isSystemProp);
      });
    } else {
      visitor(jssyValue, valueDef, path, isSystemProp);
    }
  };
  /* eslint-enable no-use-before-define */

  component.props.forEach(
    (propValue, propName) => visitValue(
      propValue,
      componentMeta.props[propName],
      [propName],
      false,
    ),
  );
  
  if (walkSystemProps) {
    component.systemProps.forEach(
      (propValue, propName) => visitValue(
        propValue,
        SYSTEM_PROPS[propName],
        [propName],
        true,
      ),
    );
  }
};

export default ProjectComponentRecord;
