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
import { getFunctionInfo } from '../utils/functions';
import { SYSTEM_PROPS } from '../constants/misc';

const ProjectComponentRecord = Record({
  id: -1,
  parentId: -1,
  isNew: false,
  isWrapper: false,
  name: '',
  title: '',
  props: Map(),
  systemProps: Map(),
  children: List(),
  layout: 0,
  regionsEnabled: Set(),
  routeId: -1,
  isIndexRoute: false,
  queryArgs: Map(),
});

const VALID_PATH_STEPS = new Set(['props', 'systemProps', 'queryArgs']);

ProjectComponentRecord.isValidPathStep = step => VALID_PATH_STEPS.has(step);
ProjectComponentRecord.expandPathStep = step => step;


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

const jssyValueToImmutable = ({ source, sourceData }) => new JssyValue({
  source,
  sourceData: sourceDataToImmutable(source, sourceData),
});

const propSourceDataToImmutableFns = {
  static: input => {
    const data = {};

    if (typeof input.value !== 'undefined') {
      if (Array.isArray(input.value)) {
        data.value = List(input.value.map(jssyValueToImmutable),
        );
      } else if (typeof input.value === 'object' && input.value !== null) {
        data.value = Map(_mapValues(input.value, jssyValueToImmutable));
      } else {
        data.value = input.value;
      }
    }

    if (typeof input.ownerPropName !== 'undefined')
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
        components: componentsToImmutable(input.component, -1, false, -1),
      }

      : {
        rootId: -1,
      },
  ),
  
  state: input => new SourceDataState(input),
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
  layout: typeof input.layout === 'number' ? input.layout : 0,
  regionsEnabled: input.regionsEnabled ? Set(input.regionsEnabled) : Set(),
  routeId,
  isIndexRoute,

  queryArgs: Map(_mapValues(
    input.queryArgs,

    dataContextArgs => Map(_mapValues(
      dataContextArgs,

      args => Map(_mapValues(args, argValue => new JssyValue({
        source: argValue.source,
        sourceData: sourceDataToImmutable(
          argValue.source,
          argValue.sourceData,
        ),
      }))),
    )),
  )),
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

export const isRootComponent = component => component.parentId === -1;

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

export const getValueByPath = (component, propName, path) => path.reduce(
  (acc, cur) => acc.sourceData.value.get(cur),
  component.props.get(propName),
);

export const walkSimpleProps = (
  component,
  componentMeta,
  visitor,
  { walkFunctionArgs = false, project = null, walkSystemProps = false } = {},
) => {
  if (walkFunctionArgs && !project) {
    throw new Error(
      'walkSimpleProps(): walkFunctionArgs is true, but there\'s no project',
    );
  }

  const visitValue = (propValue, typedef, path, isSystemProp) => {
    if (propValue.source === 'static' && !propValue.sourceData.ownerPropName) {
      if (typedef.type === 'shape' && propValue.sourceData.value !== null) {
        _forOwn(typedef.fields, (fieldTypedef, fieldName) =>
          void visitValue(
            propValue.sourceData.value.get(fieldName),
            fieldTypedef,
            [...path, fieldName],
            isSystemProp,
          ));
      } else if (
        typedef.type === 'objectOf' &&
        propValue.sourceData.value !== null
      ) {
        propValue.sourceData.value.forEach((fieldValue, key) => void visitValue(
          fieldValue,
          typedef.ofType,
          [...path, key],
          isSystemProp,
        ));
      } else if (typedef.type === 'arrayOf') {
        propValue.sourceData.value.forEach((itemValue, idx) => void visitValue(
          itemValue,
          typedef.ofType,
          [...path, idx],
          isSystemProp,
        ));
      } else {
        visitor(propValue, typedef, path, isSystemProp);
      }
    } else if (walkFunctionArgs && propValue.source === 'function') {
      const fnInfo = getFunctionInfo(
        propValue.sourceData.functionSource,
        propValue.sourceData.function,
        project,
      );

      fnInfo.args.forEach(argInfo => {
        const argName = argInfo.name;
        const argValue = propValue.sourceData.args.get(argInfo.name);

        if (argValue) {
          visitValue(
            argValue,
            argInfo.typedef,
            [...path, argName],
            isSystemProp,
          );
        }
      });
    } else {
      visitor(propValue, typedef, path, isSystemProp);
    }
  };

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
