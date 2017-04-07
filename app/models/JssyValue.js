/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Map, List } from 'immutable';
import _mapValues from 'lodash.mapvalues';
import SourceDataStatic from './SourceDataStatic';
import { isInteger } from '../utils/misc';

const JssyValueRecord = Record({
  source: '',
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
  if (Array.isArray(value))
    return JSArrayToStaticList(value);
  else if (typeof value === 'object' && value !== null)
    return JSObjectToStaticMap(value);
  else
    return value;
};

const VALID_PATH_STEPS_FUNCTION = new Set(['args']);
const VALID_PATH_STEPS_DESIGNER = new Set(['components']);
const VALID_PATH_STEPS_ACTIONS = new Set(['actions']);

class JssyValue extends JssyValueRecord {
  static staticFromJS(value) {
    return new JssyValue({
      source: 'static',
      sourceData: new SourceDataStatic({
        value: JSValueToStaticValue(value),
      }),
    });
  }
  
  static isValidPathStep(step, current) {
    if (current.source === 'static') {
      const value = current.sourceData.value;
      return (Map.isMap(value) && typeof step === 'string') ||
        (List.isList(value) && isInteger(step) && step >= 0);
    } else if (current.source === 'function') {
      return VALID_PATH_STEPS_FUNCTION.has(step);
    } else if (current.source === 'designer') {
      return VALID_PATH_STEPS_DESIGNER.has(step);
    } else if (current.source === 'actions') {
      return VALID_PATH_STEPS_ACTIONS.has(step);
    } else {
      return false;
    }
  }
  
  static expandPathStep(step, current) {
    if (current.source === 'static') return ['sourceData', 'value', step];
    else return ['sourceData', step];
  }
  
  getInStatic(path) {
    if (path.length === 0) return this;
    return this.getIn(expandPath(path));
  }
  
  setInStatic(path, jssyValue) {
    if (path.length === 0)
      throw new Error('JssyValue#setInStatic: path must not be empty');
    
    return this.setIn(expandPath(path), jssyValue);
  }
  
  updateInStatic(path, updateFn) {
    if (path.length === 0)
      throw new Error('JssyValue#updateInStatic: path must not be empty');
    
    return this.updateIn(expandPath(path), updateFn);
  }
  
  replaceStaticValue(jsValue) {
    if (this.source !== 'static') {
      throw new Error(
        'JssyValue#replaceStaticValue: current source is not \'static\'',
      );
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
    if (this.source !== 'static')
      throw new Error('JssyValue#addValueInStatic: not a static value');
    
    const path = ['sourceData', 'value'];
    
    if (typeof index === 'string')
      return this.updateIn(path, map => map.set(index, jssyValue));
    else if (index === -1)
      return this.updateIn(path, list => list.push(jssyValue));
    else if (index >= 0)
      return this.updateIn(path, list => list.insert(index, jssyValue));
    else
      throw new Error(`JssyValue#addValueInStatic: ${index} is invalid index`);
  }
  
  addJSValueInStatic(index, jsValue) {
    return this.addValueInStatic(index, JssyValue.staticFromJS(jsValue));
  }
  
  deleteValueInStatic(index) {
    if (this.source !== 'static')
      throw new Error('JssyValue#addValueInStatic: not a static value');
    
    return this.updateIn(
      ['sourceData', 'value'],
      listOrMap => listOrMap.delete(index),
    );
  }
  
  isLinkedWithData() {
    return this.source === 'data' && this.sourceData.queryPath !== null;
  }
  
  isLinkedWithOwnerProp() {
    return this.source === 'static' && !!this.sourceData.ownerPropName;
  }
  
  isLinkedWithFunction() {
    return this.source === 'function';
  }
  
  isLinkedWithState() {
    return this.source === 'state';
  }
  
  isLinked() {
    return this.isLinkedWithData() ||
      this.isLinkedWithFunction() ||
      this.isLinkedWithOwnerProp() ||
      this.isLinkedWithState();
  }
  
  getDataContext() {
    return this.sourceData.dataContext.toJS();
  }
  
  hasDesignedComponent() {
    return this.source === 'designer' && this.sourceData.rootId !== -1;
  }
  
  getActionByPath(actionPath) {
    if (this.source !== 'actions') {
      throw new Error(
        'JssyValue#getActionByPath: called on non-action JssyValue',
      );
    }
    
    const path = actionPath.reduce(
      (acc, cur) => acc.concat(
        typeof cur === 'number'
          ? [cur] // Index in actions list
          : ['params', cur]), // Branch (successActions, errorActions)
      
      [],
    );
    
    return this.getIn(['sourceData', 'actions', ...path]);
  }
}

JssyValue.STATIC_NULL = new JssyValue({
  source: 'static',
  sourceData: new SourceDataStatic({
    value: null,
  }),
});

export default JssyValue;
