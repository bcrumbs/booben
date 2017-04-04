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
    else return step;
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
        cur.branch
          ? ['params', `${cur.branch}Actions`, cur.index]
          : [cur.index],
      ),
    
      [],
    );
    
    return this.getIn(['sourceData', 'actions', ...path]);
  }
  
  addAction(actionPath, branch, action) {
    if (this.source !== 'actions')
      throw new Error('JssyValue#addAction: called on non-action JssyValue');
  
    const pathToList = actionPath.reduce(
      (acc, cur) => acc.concat(
        cur.branch
          ? ['params', `${cur.branch}Actions`, cur.index]
          : [cur.index],
      ),
      [],
    );
  
    if (branch) pathToList.push('params', `${branch}Actions`);
    
    return this.updateIn(
      ['sourceData', 'actions', ...pathToList],
      actionsList => actionsList.push(action),
    );
  }
  
  replaceAction(actionPath, newAction, replaceBranches = false) {
    if (this.source !== 'actions') {
      throw new Error(
        'JssyValue#replaceAction: called on non-action JssyValue',
      );
    }
    
    const actionIdx = actionPath[actionPath.length - 1].index;
    const pathToList = actionPath
      .reduce(
        (acc, cur) => acc.concat(
          cur.branch
            ? ['params', `${cur.branch}Actions`, cur.index]
            : [cur.index],
        ),
      
        [],
      )
      .slice(0, -1);
  
    return this.updateIn(
      ['sourceData', 'actions', ...pathToList],
      
      actionsList => {
        const oldAction = actionsList.get(actionIdx);
        
        if (oldAction.type === 'mutation' && !replaceBranches) {
          return actionsList.set(actionIdx, newAction.merge({
            successActions: oldAction.successActions,
            errorActions: oldAction.errorActions,
          }));
        } else {
          return actionsList.set(actionIdx, newAction);
        }
      },
    );
  }
  
  deleteAction(actionPath) {
    if (this.source !== 'actions')
      throw new Error('JssyValue#deleteAction: called on non-action JssyValue');
    
    const actionIdx = actionPath[actionPath.length - 1].index;
    const pathToList = actionPath
      .reduce(
        (acc, cur) => acc.concat(
          cur.branch
            ? ['params', `${cur.branch}Actions`, cur.index]
            : [cur.index],
        ),
      
        [],
      )
      .slice(0, -1);
  
    return this.updateIn(
      ['sourceData', 'actions', ...pathToList],
      actionsList => actionsList.delete(actionIdx),
    );
  }
}

JssyValue.STATIC_NULL = new JssyValue({
  source: 'static',
  sourceData: new SourceDataStatic({
    value: null,
  }),
});

export default JssyValue;
