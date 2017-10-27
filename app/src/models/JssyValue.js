/**
 * @author Dmitriy Bizyaev
 */

import { Record, Map, List } from 'immutable';
import _mapValues from 'lodash.mapvalues';
import SourceDataActionArg from './JssyValueSourceData/SourceDataActionArg';

import SourceDataActions, {
  Action,
  MutationActionParams,
  NavigateActionParams,
  URLActionParams,
  MethodCallActionParams,
  PropChangeActionParams,
  AJAXActionParams,
  LoadMoreDataActionParams,
  isAsyncAction,
} from './JssyValueSourceData/SourceDataActions';

import SourceDataConnectionPaginationState
  from './JssyValueSourceData/SourceDataConnectionPaginationState';

import SourceDataConst from './JssyValueSourceData/SourceDataConst';

import SourceDataData, {
  QueryPathStep,
} from './JssyValueSourceData/SourceDataData';

import SourceDataDesigner from './JssyValueSourceData/SourceDataDesigner';
import SourceDataFunction from './JssyValueSourceData/SourceDataFunction';
import SourceDataRouteParams from './JssyValueSourceData/SourceDataRouteParams';
import SourceDataState from './JssyValueSourceData/SourceDataState';
import SourceDataStatic from './JssyValueSourceData/SourceDataStatic';
import SourceDataOwnerProp from './JssyValueSourceData/SourceDataOwnerProp';

import {
  isString,
  isNumber,
  isInteger,
  isNaturalNumber,
  isObject,
} from '../utils/misc';

import { INVALID_ID } from '../constants/misc';

const Source = {
  INVALID: '',
  STATIC: 'static',
  OWNER_PROP: 'ownerProp',
  CONST: 'const',
  DATA: 'data',
  ROUTE_PARAMS: 'routeParams',
  STATE: 'state',
  FUNCTION: 'function',
  DESIGNER: 'designer',
  ACTIONS: 'actions',
  ACTION_ARG: 'actionArg',
  CONNECTION_PAGINATION_STATE: 'connectionPaginationState',
};

const JssyValueRecord = Record({
  source: Source.INVALID,
  sourceData: null,
});

const expandPath = path =>
  [].concat(...path.map(step => ['sourceData', 'value', step]));

/* eslint-disable no-use-before-define */

const JSArrayToStaticList = array =>
  List(array.map(JssyValue.staticFromJS));
  
const JSObjectToStaticMap = object =>
  Map(_mapValues(object, JssyValue.staticFromJS));

/* eslint-enable no-use-before-define */

const JSValueToStaticValue = value => {
  if (Array.isArray(value)) return JSArrayToStaticList(value);
  if (isObject(value)) return JSObjectToStaticMap(value);
  return value;
};

const VALID_PATH_STEPS_FUNCTION = new Set(['args']);
const VALID_PATH_STEPS_DESIGNER = new Set(['components']);
const VALID_PATH_STEPS_ACTIONS = new Set(['actions']);

class JssyValue extends JssyValueRecord {
  static staticFromJS(value) {
    return new JssyValue({
      source: Source.STATIC,
      sourceData: new SourceDataStatic({
        value: JSValueToStaticValue(value),
      }),
    });
  }
  
  static isValidPathStep(step, current) {
    if (current.sourceIs(Source.STATIC)) {
      const value = current.sourceData.value;
      return (Map.isMap(value) && isString(step)) ||
        (List.isList(value) && isNaturalNumber(step));
    }

    if (current.sourceIs(Source.FUNCTION)) {
      return VALID_PATH_STEPS_FUNCTION.has(step);
    }

    if (current.sourceIs(Source.DESIGNER)) {
      return VALID_PATH_STEPS_DESIGNER.has(step);
    }

    if (current.sourceIs(Source.ACTIONS)) {
      return VALID_PATH_STEPS_ACTIONS.has(step);
    }

    return false;
  }
  
  static expandPathStep(step, current) {
    return current.sourceIs(Source.STATIC)
      ? ['sourceData', 'value', step]
      : ['sourceData', step];
  }

  sourceIs(source) {
    return this.source === source;
  }
  
  getInStatic(path) {
    if (path.length === 0) return this;
    return this.getIn(expandPath(path));
  }
  
  setInStatic(path, jssyValue) {
    if (path.length === 0) {
      throw new Error('JssyValue#setInStatic: path must not be empty');
    }
    
    return this.setIn(expandPath(path), jssyValue);
  }

  unsetInStatic(path) {
    if (path.length === 0) {
      throw new Error('JssyValue#setInStatic: path must not be empty');
    }

    return this.deleteIn(expandPath(path));
  }
  
  updateInStatic(path, updateFn) {
    if (path.length === 0) {
      throw new Error('JssyValue#updateInStatic: path must not be empty');
    }
    
    return this.updateIn(expandPath(path), updateFn);
  }
  
  replaceStaticValue(jsValue) {
    if (!this.sourceIs(Source.STATIC)) {
      throw new Error('JssyValue#replaceStaticValue: not a static value');
    }
    
    return this.setIn(['sourceData', 'value'], JSValueToStaticValue(jsValue));
  }
  
  replaceStaticValueIn(path, jsValue) {
    if (path.length === 0) {
      return this.replaceStaticValue(jsValue);
    } else {
      return this.updateInStatic(
        path,
        jssyValue => jssyValue.replaceStaticValue(jsValue),
      );
    }
  }
  
  addValueInStatic(index, jssyValue) {
    if (!this.sourceIs(Source.STATIC)) {
      throw new Error('JssyValue#addValueInStatic: not a static value');
    }
    
    const path = ['sourceData', 'value'];
    
    if (isString(index)) {
      return this.updateIn(path, map => map.set(index, jssyValue));
    } else if (isInteger(index)) {
      if (index === -1) {
        return this.updateIn(path, list => list.push(jssyValue));
      } else if (index >= 0) {
        return this.updateIn(path, list => list.insert(index, jssyValue));
      }
    }

    throw new Error(`JssyValue#addValueInStatic: ${index} is invalid index`);
  }
  
  deleteValueInStatic(index) {
    if (!this.sourceIs(Source.STATIC)) {
      throw new Error('JssyValue#addValueInStatic: not a static value');
    }
    
    return this.updateIn(
      ['sourceData', 'value'],
      listOrMap => listOrMap.delete(index),
    );
  }
  
  isLinkedWithData() {
    return this.sourceIs(Source.DATA) &&
      this.sourceData.queryPath !== null;
  }
  
  isLinkedWithOwnerProp() {
    return this.sourceIs(Source.OWNER_PROP);
  }
  
  isLinkedWithFunction() {
    return this.sourceIs(Source.FUNCTION);
  }
  
  isLinkedWithState() {
    return this.sourceIs(Source.STATE) &&
      this.sourceData.componentId !== INVALID_ID;
  }
  
  isLinkedWithRouteParam() {
    return this.sourceIs(Source.ROUTE_PARAMS);
  }
  
  isLinkedWithActionArg() {
    return this.sourceIs(Source.ACTION_ARG);
  }
  
  isLinked() {
    return this.isLinkedWithData() ||
      this.isLinkedWithFunction() ||
      this.isLinkedWithOwnerProp() ||
      this.isLinkedWithState() ||
      this.isLinkedWithRouteParam() ||
      this.isLinkedWithActionArg();
  }
  
  getDataContext() {
    return this.sourceData.dataContext.toJS();
  }

  resetDataLink() {
    if (!this.sourceIs(Source.DATA)) {
      throw new Error('JssyValue#resetDataLink called on non-data value');
    }

    return this.set('sourceData', new SourceDataData({ queryPath: null }));
  }
  
  getQueryStepArgValues(stepIdx) {
    if (!this.isLinkedWithData()) {
      throw new Error('JssyValue#getQueryStepArgValues: Not a data value');
    }
    
    const keyForQueryArgs = this.sourceData.queryPath
      .slice(0, stepIdx + 1)
      .map(step => step.field)
      .join(' ');
  
    return this.sourceData.queryArgs.get(keyForQueryArgs);
  }
  
  hasDesignedComponent() {
    return this.sourceIs(Source.DESIGNER) &&
      this.sourceData.rootId !== INVALID_ID;
  }
  
  getActionByPath(actionPath) {
    if (!this.sourceIs(Source.ACTIONS)) {
      throw new Error(
        'JssyValue#getActionByPath: called on non-action JssyValue',
      );
    }
    
    const path = actionPath.reduce(
      (acc, cur) => acc.concat(
        isNumber(cur)
          ? [cur] // Index in actions list
          : ['params', cur]), // Branch (successActions, errorActions)
      
      [],
    );
    
    return this.getIn(['sourceData', 'actions', ...path]);
  }
}

JssyValue.STATIC_NULL = JssyValue.staticFromJS(null);
JssyValue.Source = Source;

export default JssyValue;

export {
  SourceDataActionArg,
  SourceDataActions,
  Action,
  MutationActionParams,
  NavigateActionParams,
  URLActionParams,
  MethodCallActionParams,
  PropChangeActionParams,
  AJAXActionParams,
  LoadMoreDataActionParams,
  isAsyncAction,
  SourceDataConnectionPaginationState,
  SourceDataConst,
  SourceDataData,
  QueryPathStep,
  SourceDataDesigner,
  SourceDataFunction,
  SourceDataRouteParams,
  SourceDataState,
  SourceDataStatic,
  SourceDataOwnerProp,
};
