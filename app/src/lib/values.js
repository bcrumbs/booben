
import React from 'react';
import _forOwn from 'lodash.forown';
import _mapValues from 'lodash.mapvalues';
import { TypeNames, resolveTypedef, coerceValue } from 'booben-types';

import {
  getFieldByPath,
  getBoobenValueDefOfField,
  getBoobenValueDefOfQueryArgument,
  RELAY_PAGEINFO_FIELD_END_CURSOR,
} from 'booben-graphql-schema';

import { extractPropValueFromData } from './graphql';
import { getFunctionInfo, formatFunctionId } from './functions';
import { getComponentMeta, getSourceConfig } from './meta';

import {
  mapListToArray,
  mapMapToObject,
  isUndef,
  hasOwnProperty,
  returnNull,
} from '../utils/misc';

import BoobenValue from '../models/BoobenValue';
import { ROUTE_PARAM_VALUE_DEF, NO_VALUE, INVALID_ID } from '../constants/misc';

/**
 * @typedef {Object} AJAXRequestResult
 * @property {?Error} error
 * @property {number} status
 * @property {Object<string, string>} headers
 * @property {*} body
 */

/**
 * @typedef {Object} ValueContext
 * @property {?Object<string, Object<string, ComponentMeta>>} [meta=null]
 * @property {?DataSchema} [schema=null]
 * @property {?Immutable.Map<number, Object>} [components=null]
 * @property {?Immutable.Map<number, Immutable.Map<string, *>>} [componentsState=null]
 * @property {?Object<string, *>} [propsFromOwner=null]
 * @property {?DataContextsInfo} [dataContextInfo=null]
 * @property {?Immutable.Map<string, Object>} [projectFunctions=null]
 * @property {?Immutable.Map<Object, DataContextsInfo>} [theMap=null]
 * @property {?Object} [data=null]
 * @property {?Object<string, string>} [routeParams=null]
 * @property {?Array<*>} [actionArgValues=null]
 * @property {?BoobenValueDefinition} [actionValueDef=null]
 * @property {?Object<string, BoobenTypeDefinition>} [actionUserTypedefs=null]
 * @property {?AJAXRequestResult} [ajaxRequestResult=null]
 * @property {?ReactComponent} [BuilderComponent=null]
 * @property {?function(ownProps: Object<string, *>, boobenValue: Object, context: ValueContext): Object<string, *>} [getBuilderProps=null]
 * @property {?Function} [handleActions=null]
 * @property {?Immutable.Map<Object, Immutable.Map<number, Object>>} [pageInfos=null]
 */

const defaultContext = {
  meta: null,
  schema: null,
  components: null,
  componentsState: null,
  propsFromOwner: null,
  dataContextInfo: null,
  projectFunctions: null,
  theMap: null,
  data: null,
  routeParams: null,
  actionArgValues: null,
  actionValueDef: null,
  actionUserTypedefs: null,
  ajaxRequestResult: null,
  BuilderComponent: null,
  getBuilderProps: null,
  handleActions: null,
  pageInfos: null,
};

/* eslint-disable no-use-before-define */

/**
 *
 * @param {Object} boobenValue
 * @param {?ValueContext} context
 */
const buildOwnerPropValue = (boobenValue, context) => {
  const { propsFromOwner } = context;
  const propName = boobenValue.sourceData.ownerPropName;

  if (propsFromOwner === null || !hasOwnProperty(propsFromOwner, propName)) {
    return NO_VALUE;
  }

  return propsFromOwner[propName];
};

/**
 *
 * @param {Object} boobenValue
 * @param {BoobenValueDefinition} valueDef
 * @param {?Object<string, BoobenTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildStaticValue = (boobenValue, valueDef, userTypedefs, context) => {
  const resolvedTypedef = resolveTypedef(valueDef, userTypedefs);

  if (resolvedTypedef.type === TypeNames.SHAPE) {
    if (boobenValue.sourceData.value === null) return null;

    const ret = {};

    _forOwn(resolvedTypedef.fields, (fieldMeta, fieldName) => {
      const fieldValue = boobenValue.sourceData.value.get(fieldName);

      if (!isUndef(fieldValue)) {
        ret[fieldName] = buildValue(
          fieldValue,
          fieldMeta,
          userTypedefs,
          context,
        );
      }
    });

    return ret;
  } else if (resolvedTypedef.type === TypeNames.OBJECT_OF) {
    if (boobenValue.sourceData.value === null) return null;

    return mapMapToObject(boobenValue.sourceData.value, nestedValue => buildValue(
      nestedValue,
      resolvedTypedef.ofType,
      userTypedefs,
      context,
    ));
  } else if (resolvedTypedef.type === TypeNames.ARRAY_OF) {
    return mapListToArray(boobenValue.sourceData.value, nestedValue => buildValue(
      nestedValue,
      resolvedTypedef.ofType,
      userTypedefs,
      context,
    ));
  } else {
    return boobenValue.sourceData.value;
  }
};

/**
 *
 * @param {Object} boobenValue
 * @return {*}
 */
const buildConstValue = boobenValue => boobenValue.sourceData.value;

/**
 *
 * @param {Object} boobenValue
 * @param {BoobenValueDefinition} valueDef
 * @param {?Object<string, BoobenTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildDataValue = (boobenValue, valueDef, userTypedefs, context) => {
  const { schema, propsFromOwner, dataContextInfo, data } = context;

  if (boobenValue.sourceData.queryPath === null) {
    return NO_VALUE;
  }

  if (schema === null) {
    throw new Error(
      'buildDataValue(): schema is required to build data values',
    );
  }

  const path = mapListToArray(
    boobenValue.sourceData.queryPath,
    step => step.field,
  );

  let rawValue;
  let field;

  if (boobenValue.sourceData.dataContext.size > 0) {
    const dataContextName = boobenValue.sourceData.dataContext.last();

    if (
      dataContextInfo === null ||
      !hasOwnProperty(dataContextInfo, dataContextName)
    ) {
      return NO_VALUE;
    }

    const ourDataContextInfo = dataContextInfo[dataContextName];

    if (
      propsFromOwner === null ||
      !hasOwnProperty(propsFromOwner, ourDataContextInfo.ownerPropName)
    ) {
      return NO_VALUE;
    }

    field = getFieldByPath(schema, path, ourDataContextInfo.type);
    rawValue = extractPropValueFromData(
      boobenValue,
      propsFromOwner[ourDataContextInfo.ownerPropName],
      schema,
      ourDataContextInfo.type,
    );
  } else {
    if (data === null) {
      return NO_VALUE;
    }

    field = getFieldByPath(schema, path);
    rawValue = extractPropValueFromData(boobenValue, data, schema);
  }

  return coerceValue(
    rawValue,
    getBoobenValueDefOfField(field, schema),
    valueDef,
    null,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} boobenValue
 * @param {BoobenValueDefinition} valueDef
 * @param {?Object<string, BoobenTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildFunctionValue = (boobenValue, valueDef, userTypedefs, context) => {
  const { projectFunctions } = context;

  const fnInfo = getFunctionInfo(
    boobenValue.sourceData.functionSource,
    boobenValue.sourceData.function,
    projectFunctions,
  );

  if (fnInfo === null) {
    const functionId = formatFunctionId(
      boobenValue.sourceData.functionSource,
      boobenValue.sourceData.function,
    );

    throw new Error(`buildFunctionValue(): function not found: ${functionId}`);
  }

  const tooManyArgs = (
    fnInfo.args.size === 0 &&
    boobenValue.sourceData.args.size > 0
  ) || (
    boobenValue.sourceData.args.size > fnInfo.args.size &&
    !fnInfo.spreadLastArg
  );

  if (tooManyArgs) {
    const functionId = formatFunctionId(
      boobenValue.sourceData.functionSource,
      boobenValue.sourceData.function,
    );

    throw new Error(
      `buildFunctionValue(): too many arguments for function ${functionId}`,
    );
  }

  const argValues = mapListToArray(boobenValue.sourceData.args, (value, idx) => {
    const argInfo = fnInfo.args.get(Math.min(idx, fnInfo.args.size - 1));

    let ret = NO_VALUE;

    if (value) {
      ret = buildValue(value, argInfo.typedef, userTypedefs, context);
    }

    if (ret === NO_VALUE) {
      if (argInfo.isRequired) {
        const functionId = formatFunctionId(
          boobenValue.sourceData.functionSource,
          boobenValue.sourceData.function,
        );

        throw new Error(
          `buildFunctionValue(): failed to build required argument ${idx} ` +
          `for function ${functionId}`,
        );
      } else {
        ret = argInfo.defaultValue;
      }
    }

    return ret;
  });

  const rawValue = fnInfo.fn(...argValues);

  return coerceValue(
    rawValue,
    fnInfo.returnType,
    valueDef,
    null,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} boobenValue
 * @param {BoobenValueDefinition} valueDef
 * @param {?Object<string, BoobenTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildStateValue = (boobenValue, valueDef, userTypedefs, context) => {
  const { meta, components, componentsState } = context;

  if (meta === null || components === null || componentsState === null) {
    throw new Error(
      'buildStateValue(): meta, components and componentsState ' +
      'are required to build state values',
    );
  }

  const componentId = boobenValue.sourceData.componentId;

  if (componentId === INVALID_ID) {
    return NO_VALUE;
  }

  const stateSlot = boobenValue.sourceData.stateSlot;
  const componentState = componentsState.get(componentId);

  if (!componentState || !componentState.has(stateSlot)) {
    return NO_VALUE;
  }

  const rawValue = componentState.get(stateSlot);
  const sourceComponent = components.get(componentId);
  const sourceComponentMeta = getComponentMeta(sourceComponent.name, meta);
  const stateSlotMeta = sourceComponentMeta.state[stateSlot];

  return coerceValue(
    rawValue,
    stateSlotMeta,
    valueDef,
    sourceComponentMeta.types,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} boobenValue
 * @param {BoobenValueDefinition} valueDef
 * @param {?Object<string, BoobenTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildRouteParamsValue = (boobenValue, valueDef, userTypedefs, context) => {
  const { routeParams } = context;

  if (routeParams === null) {
    throw new Error('buildRouteParamsValue(): routeParams is required');
  }

  const paramName = boobenValue.sourceData.paramName;

  if (!hasOwnProperty(routeParams, paramName)) {
    throw new Error(
      `buildRouteParamsValue(): unknown route param: ${paramName}`,
    );
  }

  return coerceValue(
    routeParams[paramName],
    ROUTE_PARAM_VALUE_DEF,
    valueDef,
    null,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} boobenValue
 * @param {BoobenValueDefinition} valueDef
 * @param {?Object<string, BoobenTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildActionArgValue = (boobenValue, valueDef, userTypedefs, context) => {
  const { actionArgValues, actionValueDef, actionUserTypedefs } = context;

  if (
    actionArgValues === null ||
    actionValueDef === null ||
    actionUserTypedefs === null
  ) {
    throw new Error(
      'buildActionArgValue(): actionArgValues, actionValueDef and ' +
      'actionUserTypedefs are required',
    );
  }

  const argIdx = boobenValue.sourceData.arg;

  return coerceValue(
    actionArgValues[argIdx],
    getSourceConfig(actionValueDef, 'actions').args[argIdx],
    valueDef,
    actionUserTypedefs,
    userTypedefs,
  );
};

/**
 *
 * @param {Object} boobenValue
 * @param {?ValueContext} context
 * @return {ReactComponent}
 */
const buildDesignerValue = (boobenValue, context) => {
  const { BuilderComponent, getBuilderProps } = context;

  if (!boobenValue.hasDesignedComponent()) return returnNull;

  if (BuilderComponent === null || getBuilderProps === null) {
    throw new Error(
      'buildDesignerValue(): BuilderComponent and getBuilderProps are required',
    );
  }

  const ret = ownProps => (
    <BuilderComponent {...getBuilderProps(ownProps, boobenValue, context)}>
      {ownProps.children}
    </BuilderComponent>
  );

  ret.displayName = `designerValueBuilder(${BuilderComponent})`;

  return ret;
};

/**
 *
 * @param {Object} boobenValue
 * @param {BoobenValueDefinition} valueDef
 * @param {?Object<string, BoobenTypeDefinition>} userTypedefs
 * @param {?ValueContext} context
 * @return {*}
 */
const buildActionsValue = (boobenValue, valueDef, userTypedefs, context) => {
  const { handleActions } = context;

  if (handleActions === null) {
    throw new Error('buildActionsValue(): handleActions is required');
  }

  return (...args) => {
    const nextValueContext = {
      ...context,
      actionArgValues: args,
      actionValueDef: valueDef,
      actionUserTypedefs: userTypedefs,
    };

    handleActions(boobenValue, valueDef, userTypedefs, nextValueContext);
  };
};

/**
 *
 * @param {Object} boobenValue
 * @param {?ValueContext} context
 * @return {*}
 */
const buildConnectionPaginationStateValue = (boobenValue, context) => {
  const param = boobenValue.sourceData.param;
  const dataValue = boobenValue.sourceData.dataValue;
  const queryStep = boobenValue.sourceData.queryStep;

  if (param === 'after') {
    if (context.pageInfos === null || !context.pageInfos.has(dataValue)) {
      return '';
    }

    const pageInfosForValue = context.pageInfos.get(dataValue);
    if (!pageInfosForValue.has(queryStep)) {
      return '';
    }

    const pageInfo = pageInfosForValue.get(queryStep);
    return pageInfo[RELAY_PAGEINFO_FIELD_END_CURSOR] || '';
  } else {
    throw new Error(
      `buildConnectionPaginationStateValue(): unknown param: '${param}'`,
    );
  }
};

/**
 *
 * @param {Object} boobenValue
 * @param {BoobenValueDefinition} valueDef
 * @param {?Object<string, BoobenTypeDefinition>} [userTypedefs=null]
 * @param {?ValueContext} [context=null]
 */
export const buildValue = (
  boobenValue,
  valueDef,
  userTypedefs = null,
  context = null,
) => {
  const actualContext = context === null
    ? defaultContext
    : { ...defaultContext, ...context };

  if (boobenValue.sourceIs(BoobenValue.Source.STATIC)) {
    return buildStaticValue(boobenValue, valueDef, userTypedefs, actualContext);
  } else if (boobenValue.sourceIs(BoobenValue.Source.OWNER_PROP)) {
    return buildOwnerPropValue(boobenValue, actualContext);
  } else if (boobenValue.sourceIs(BoobenValue.Source.CONST)) {
    return buildConstValue(boobenValue);
  } else if (boobenValue.sourceIs(BoobenValue.Source.DATA)) {
    return buildDataValue(boobenValue, valueDef, userTypedefs, actualContext);
  } else if (boobenValue.sourceIs(BoobenValue.Source.FUNCTION)) {
    return buildFunctionValue(boobenValue, valueDef, userTypedefs, actualContext);
  } else if (boobenValue.sourceIs(BoobenValue.Source.STATE)) {
    return buildStateValue(boobenValue, valueDef, userTypedefs, actualContext);
  } else if (boobenValue.sourceIs(BoobenValue.Source.ROUTE_PARAMS)) {
    return buildRouteParamsValue(
      boobenValue,
      valueDef,
      userTypedefs,
      actualContext,
    );
  } else if (boobenValue.sourceIs(BoobenValue.Source.ACTION_ARG)) {
    return buildActionArgValue(
      boobenValue,
      valueDef,
      userTypedefs,
      actualContext,
    );
  } else if (boobenValue.sourceIs(BoobenValue.Source.DESIGNER)) {
    return buildDesignerValue(boobenValue, actualContext);
  } else if (boobenValue.sourceIs(BoobenValue.Source.ACTIONS)) {
    return buildActionsValue(boobenValue, valueDef, userTypedefs, actualContext);
  } else if (boobenValue.sourceIs(BoobenValue.Source.CONNECTION_PAGINATION_STATE)) {
    return buildConnectionPaginationStateValue(boobenValue, actualContext);
  } else {
    throw new Error(`buildValue(): unknown value source: ${boobenValue.source}`);
  }
};

/* eslint-enable no-use-before-define */

/**
 *
 * @param {Object} component
 * @param {Object<string, Object<string, ComponentMeta>>} meta
 * @param {?ValueContext} [valueContext=null]
 * @param {?Array<string>} [stateSlots=null]
 * @return {Object<string, *>}
 * @private
 */
export const buildInitialComponentState = (
  component,
  meta,
  valueContext = null,
  stateSlots = null,
) => {
  const componentMeta = getComponentMeta(component.name, meta);

  if (!componentMeta.state) return {};

  const ret = {};

  const activeStateSlots = stateSlots === null
    ? Object.keys(componentMeta.state)
    : stateSlots;

  activeStateSlots.forEach(stateSlotName => {
    const stateSlot = componentMeta.state[stateSlotName];
    if (!stateSlot) return;

    const initialValue = stateSlot.initialValue;

    if (initialValue.source === 'const') {
      ret[stateSlotName] = initialValue.sourceData.value;
    } else if (initialValue.source === 'prop') {
      const propValue = component.props.get(initialValue.sourceData.propName);
      const propMeta = componentMeta.props[initialValue.sourceData.propName];
      const value = buildValue(
        propValue,
        propMeta,
        componentMeta.types,
        valueContext,
      );

      if (value !== NO_VALUE) {
        ret[stateSlotName] = value;
      }
    }
  });

  return ret;
};

/**
 *
 * @param {Object<string, { argDefinition: DataFieldArg, argValue: Object }>} graphQLVariables
 * @param {ValueContext} valueContext
 * @param {DataSchema} schema
 * @return {Object<string, *>}
 */
export const buildGraphQLQueryVariables = (
  graphQLVariables,
  valueContext,
  schema,
) => _mapValues(graphQLVariables, ({ argDefinition, argValue }) => buildValue(
  argValue,
  getBoobenValueDefOfQueryArgument(argDefinition, schema),
  null,
  valueContext,
));
