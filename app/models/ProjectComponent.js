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
import SourceDataAction from './SourceDataAction';
import SourceDataDesigner from './SourceDataDesigner';
import { getFunctionInfo } from '../utils/functions';

const ProjectComponentRecord = Record({
  id: -1,
  parentId: -1,
  isNew: false,
  isWrapper: false,
  name: '',
  title: '',
  props: Map(),
  children: List(),
  layout: 0,
  regionsEnabled: Set(),
  routeId: -1,
  isIndexRoute: false,
  queryArgs: Map(),
});

/* eslint-disable no-use-before-define */
const propSourceDataToImmutableFns = {
  static: input => {
    const data = {};

    if (typeof input.value !== 'undefined') {
      if (Array.isArray(input.value)) {
        data.value = List(input.value.map(
          ({ source, sourceData }) => new JssyValue({
            source,
            sourceData: sourceDataToImmutable(source, sourceData),
          })),
        );
      } else if (typeof input.value === 'object' && input.value !== null) {
        data.value = Map(_mapValues(
          input.value,

          ({ source, sourceData }) => new JssyValue({
            source,
            sourceData: sourceDataToImmutable(source, sourceData),
          })),
        );
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
    args: Map().withMutations(args => {
      _forOwn(input.args, (arg, name) => {
        args.set(name, new JssyValue({
          source: arg.source,
          sourceData: sourceDataToImmutable(arg.source, arg.sourceData),
        }));
      });
    }),
  }),

  const: input => new SourceDataConst(input),
  action: input => new SourceDataAction(input),

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
};
/* eslint-enable no-use-before-define */

export const sourceDataToImmutable = (source, sourceData) =>
    propSourceDataToImmutableFns[source](sourceData);

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

  props: Map(_mapValues(input.props, propValue => new JssyValue({
    source: propValue.source,
    sourceData: sourceDataToImmutable(
      propValue.source,
      propValue.sourceData,
    ),
  }))),

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
  { walkFunctionArgs = false, project = null } = {},
) => {
  if (walkFunctionArgs && !project) {
    throw new Error(
      'walkSimpleProps(): walkFunctionArgs is true, but no project',
    );
  }

  const visitValue = (propValue, typedef, path) => {
    if (propValue.source === 'static' && !propValue.sourceData.ownerPropName) {
      if (typedef.type === 'shape' && propValue.sourceData.value !== null) {
        _forOwn(typedef.fields, (fieldTypedef, fieldName) =>
          void visitValue(
            propValue.sourceData.value.get(fieldName),
            fieldTypedef,
            [...path, fieldName],
          ));
      } else if (
        typedef.type === 'objectOf' &&
        propValue.sourceData.value !== null
      ) {
        propValue.sourceData.value.forEach((fieldValue, key) =>
          void visitValue(fieldValue, typedef.ofType, [...path, key]));
      } else if (typedef.type === 'arrayOf') {
        propValue.sourceData.value.forEach((itemValue, idx) =>
          void visitValue(itemValue, typedef.ofType, [...path, idx]));
      } else {
        visitor(propValue, typedef, path);
      }
    } else if (walkFunctionArgs && propValue.source === 'function') {
      const fnInfo = getFunctionInfo(
        propValue.sourceData.functionSource,
        propValue.sourceData.function,
        project,
      );

      fnInfo.args.forEach(argInfo => {
        const argName = argInfo.name,
          argValue = propValue.sourceData.args.get(argInfo.name);

        if (argValue) visitValue(argValue, argInfo.typedef, [...path, argName]);
      });
    } else {
      visitor(propValue, typedef, path);
    }
  };

  component.props.forEach(
    (propValue, propName) => visitValue(
      propValue,
      componentMeta.props[propName],
      [propName],
    ),
  );
};

export default ProjectComponentRecord;
