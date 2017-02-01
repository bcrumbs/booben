/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Map, List } from 'immutable';
import _mapValues from 'lodash.mapvalues';
import SourceDataStatic from './SourceDataStatic';

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

class JssyValue extends JssyValueRecord {
  static staticFromJS(value) {
    return new JssyValue({
      source: 'static',
      sourceData: new SourceDataStatic({
        value: JSValueToStaticValue(value),
      }),
    });
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
  
  addValueInStatic(path, index, jssyValue) {
    const realPath = expandPath(path).concat(['sourceData', 'value']);
  
    if (typeof index === 'string')
      return this.updateIn(realPath, map => map.set(index, jssyValue));
    else if (index === -1)
      return this.updateIn(realPath, list => list.push(jssyValue));
    else if (index >= 0)
      return this.updateIn(realPath, list => list.insert(index, jssyValue));
    else
      throw new Error(`JssyValue#addValueInStatic: ${index} is invalid index`);
  }
  
  addJSValueInStatic(path, index, jsValue) {
    return this.addValueInStatic(path, index, JssyValue.staticFromJS(jsValue));
  }
  
  deleteValueInStatic(path, index) {
    const realPath = expandPath(path).concat(['sourceData', 'value']);
    return this.updateIn(realPath, listOrMap => listOrMap.delete(index));
  }
}

JssyValue.STATIC_NULL = new JssyValue({
  source: 'static',
  sourceData: new SourceDataStatic({
    value: null,
  }),
});

export default JssyValue;
