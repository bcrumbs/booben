import { Record, Map, List } from 'immutable';
import _mapValues from 'lodash.mapvalues';
import SourceDataActionArg from './BoobenValueSourceData/SourceDataActionArg';

import SourceDataActions, {
  Action,
  ActionTypes,
  MutationActionParams,
  NavigateActionParams,
  URLActionParams,
  MethodCallActionParams,
  PropChangeActionParams,
  AJAXActionParams,
  LoadMoreDataActionParams,
  isAsyncAction,
} from './BoobenValueSourceData/SourceDataActions';

import SourceDataConnectionPaginationState
  from './BoobenValueSourceData/SourceDataConnectionPaginationState';

import SourceDataConst from './BoobenValueSourceData/SourceDataConst';

import SourceDataData, {
  QueryPathStep,
} from './BoobenValueSourceData/SourceDataData';

import SourceDataDesigner from './BoobenValueSourceData/SourceDataDesigner';
import SourceDataFunction from './BoobenValueSourceData/SourceDataFunction';
import SourceDataRouteParams from './BoobenValueSourceData/SourceDataRouteParams';
import SourceDataState from './BoobenValueSourceData/SourceDataState';
import SourceDataStatic from './BoobenValueSourceData/SourceDataStatic';
import SourceDataOwnerProp from './BoobenValueSourceData/SourceDataOwnerProp';

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

const BoobenValueRecord = Record({
  source: Source.INVALID,
  sourceData: null,
});

const expandPath = path =>
  [].concat(...path.map(step => ['sourceData', 'value', step]));

/* eslint-disable no-use-before-define */

const JSArrayToStaticList = array =>
  List(array.map(BoobenValue.staticFromJS));
  
const JSObjectToStaticMap = object =>
  Map(_mapValues(object, BoobenValue.staticFromJS));

/* eslint-enable no-use-before-define */

const JSValueToStaticValue = value => {
  if (Array.isArray(value)) return JSArrayToStaticList(value);
  if (isObject(value)) return JSObjectToStaticMap(value);
  return value;
};

const VALID_PATH_STEPS_FUNCTION = new Set(['args']);
const VALID_PATH_STEPS_DESIGNER = new Set(['components']);
const VALID_PATH_STEPS_ACTIONS = new Set(['actions']);

class BoobenValue extends BoobenValueRecord {
  static staticFromJS(value) {
    return new BoobenValue({
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
  
  setInStatic(path, boobenValue) {
    if (path.length === 0) {
      throw new Error('BoobenValue#setInStatic: path must not be empty');
    }
    
    return this.setIn(expandPath(path), boobenValue);
  }

  unsetInStatic(path) {
    if (path.length === 0) {
      throw new Error('BoobenValue#setInStatic: path must not be empty');
    }

    return this.deleteIn(expandPath(path));
  }
  
  updateInStatic(path, updateFn) {
    if (path.length === 0) {
      throw new Error('BoobenValue#updateInStatic: path must not be empty');
    }
    
    return this.updateIn(expandPath(path), updateFn);
  }
  
  replaceStaticValue(jsValue) {
    if (!this.sourceIs(Source.STATIC)) {
      throw new Error('BoobenValue#replaceStaticValue: not a static value');
    }
    
    return this.setIn(['sourceData', 'value'], JSValueToStaticValue(jsValue));
  }
  
  replaceStaticValueIn(path, jsValue) {
    if (path.length === 0) {
      return this.replaceStaticValue(jsValue);
    } else {
      return this.updateInStatic(
        path,
        boobenValue => boobenValue.replaceStaticValue(jsValue),
      );
    }
  }
  
  addValueInStatic(index, boobenValue) {
    if (!this.sourceIs(Source.STATIC)) {
      throw new Error('BoobenValue#addValueInStatic: not a static value');
    }
    
    const path = ['sourceData', 'value'];
    
    if (isString(index)) {
      return this.updateIn(path, map => map.set(index, boobenValue));
    } else if (isInteger(index)) {
      if (index === -1) {
        return this.updateIn(path, list => list.push(boobenValue));
      } else if (index >= 0) {
        return this.updateIn(path, list => list.insert(index, boobenValue));
      }
    }

    throw new Error(`BoobenValue#addValueInStatic: ${index} is invalid index`);
  }
  
  deleteValueInStatic(index) {
    if (!this.sourceIs(Source.STATIC)) {
      throw new Error('BoobenValue#addValueInStatic: not a static value');
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
      throw new Error('BoobenValue#resetDataLink called on non-data value');
    }

    return this.set('sourceData', new SourceDataData({ queryPath: null }));
  }
  
  getQueryStepArgValues(stepIdx) {
    if (!this.isLinkedWithData()) {
      throw new Error('BoobenValue#getQueryStepArgValues: Not a data value');
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
        'BoobenValue#getActionByPath: called on non-action BoobenValue',
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

BoobenValue.STATIC_NULL = BoobenValue.staticFromJS(null);
BoobenValue.Source = Source;

export default BoobenValue;

export {
  SourceDataActionArg,
  SourceDataActions,
  Action,
  ActionTypes,
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
