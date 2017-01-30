/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Map } from 'immutable';
import _mapValues from 'lodash.mapvalues';

import {
  PropsList,
  Prop,
  jssyTypeToView,
  jssyValueToPropValue,
} from '../../../../components/PropsList/PropsList';

import {
  makeDefaultValue,
  getNestedTypedef,
} from '../../../../../shared/types';

import { staticJssyValueFromJs } from '../../../../models/ProjectComponentProp';
import { getJssyTypeOfField } from '../../../../utils/schema';
import { noop, returnArg, objectToArray } from '../../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  field: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  fieldArgs: PropTypes.object,
  getLocalizedText: PropTypes.func,
  onArgsUpdate: PropTypes.func,
};

const defaultProps = {
  fieldArgs: null,
  getLocalizedText: returnArg,
  onArgsUpdate: noop,
};

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceIntValue = value => {
  const maybeRet = parseInt(value, 10);
  if (!isFinite(maybeRet)) return 0;
  return maybeRet;
};

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceFloatValue = value => {
  const maybeRet = parseFloat(value);
  if (!isFinite(maybeRet)) return 0.0;
  return maybeRet;
};

/**
 *
 * @param {number} index
 * @return {string}
 */
const formatArrayItemLabel = index => `Item ${index}`; // TODO: Get string from i18n

export class DataSelectionArgsEditor extends PureComponent {
  constructor(props) {
    super(props);
    
    this._handleCheck = this._handleCheck.bind(this);
    this._handleUpdateValue = this._handleUpdateValue.bind(this);
    this._handleAddValue = this._handleAddValue.bind(this);
    this._handleDeleteValue = this._handleDeleteValue.bind(this);
  }
  
  /**
   *
   * @param {DataFieldTypeDefinition} dataFieldTypedef
   * @param {TypeDefinition} jssyTypedef
   * @param {string} [name='']
   * @return {PropsItemPropType}
   * @private
   */
  _getPropTypeForArgument(dataFieldTypedef, jssyTypedef, name = '') {
    const { schema } = this.props;
    
    const ret = {
      label: name,
      secondaryLabel: jssyTypedef.type,
      view: jssyTypeToView(jssyTypedef.type),
      image: '',
      tooltip: dataFieldTypedef.description,
      linkable: false,
      checkable: !dataFieldTypedef.nonNull,
      required: dataFieldTypedef.nonNull,
      transformValue: null,
      formatItemLabel: null,
    };
    
    if (jssyTypedef.type === 'int') {
      ret.transformValue = coerceIntValue;
    } else if (jssyTypedef.type === 'float') {
      ret.transformValue = coerceFloatValue;
    } else if (jssyTypedef.type === 'oneOf') {
      ret.options = jssyTypedef.options.map(option => ({
        value: option.value,
        text: String(option.value),
      }));
    } else if (jssyTypedef.type === 'shape') {
      /** @type {DataObjectType} */
      const dataType = schema.types[dataFieldTypedef.type];
      
      ret.fields = _mapValues(jssyTypedef.fields, (fieldTypedef, fieldName) => {
        const nestedDataFieldTypedef = dataType.fields[fieldName];
        
        return this._getPropTypeForArgument(
          nestedDataFieldTypedef,
          fieldTypedef,
          fieldName,
        );
      });
    } else if (jssyTypedef.type === 'arrayOf') {
      ret.ofType = this._getPropTypeForArgument(
        dataFieldTypedef,
        jssyTypedef.ofType,
      );
      ret.formatItemLabel = formatArrayItemLabel;
    } else if (jssyTypedef.type === 'objectOf') {
      ret.ofType = this._getPropTypeForArgument(
        dataFieldTypedef,
        jssyTypedef.ofType,
      );
      ret.formatItemLabel = returnArg;
    }
    
    return ret;
  }
  
  /**
   *
   * @param {Object} jssyValue
   * @param {TypeDefinition} jssyTypedef
   * @return {PropsItemValue}
   * @private
   */
  _getValueForArgument(jssyValue, jssyTypedef) {
    if (jssyValue) {
      // Argument has value
      const value = jssyValueToPropValue(jssyValue, jssyTypedef);
      value.checked = true;
      return value;
    } else {
      // Argument has no value ("is null" in terms of GraphQL)
      return {
        value: makeDefaultValue(jssyTypedef),
        linked: false,
        checked: false,
      };
    }
  }
  
  /**
   *
   * @param {string} argName
   * @param {boolean} checked
   * @param {(string|number)[]} path
   * @private
   */
  _handleCheck({ propName: argName, checked, path }) {
    const { field, schema, fieldArgs, onArgsUpdate } = this.props;
    
    let newArgs = fieldArgs || Map();
    
    if (checked) {
      const arg = field.args[argName];
      const jssyTypedef = getJssyTypeOfField(arg, schema);
      const nestedTypedef = getNestedTypedef(jssyTypedef, path);
      const newValue = staticJssyValueFromJs(makeDefaultValue(nestedTypedef));
      const pathToValue = [argName]
        .concat(...path.map(step => ['sourceData', 'value', step]));
      
      newArgs = newArgs.setIn(pathToValue, newValue);
    } else if (path.length === 0) {
      newArgs = newArgs.delete(argName);
    } else {
      const pathToValue = [argName, 'sourceData', 'value']
        .concat(...path.map(step => [step, 'sourceData', 'value']));
      
      newArgs = newArgs.setIn(pathToValue, null);
    }
  
    onArgsUpdate({ args: newArgs });
  }
  
  /**
   *
   * @param {string} argName
   * @param {*} value
   * @param {(string|number)[]} path
   * @private
   */
  _handleUpdateValue({ propName: argName, value, path }) {
    const { field, schema, fieldArgs, onArgsUpdate } = this.props;
    
    let newArgs = fieldArgs || Map();
    
    if (!newArgs.has(argName)) {
      const arg = field.args[argName];
      const jssyTypedef = getJssyTypeOfField(arg, schema);
      const initialValue = staticJssyValueFromJs(makeDefaultValue(jssyTypedef));
      newArgs = newArgs.set(argName, initialValue);
    }
    
    const pathToValue = [argName, 'sourceData', 'value']
      .concat(...path.map(step => [step, 'sourceData', 'value']));
    
    newArgs = newArgs.setIn(pathToValue, value);
    onArgsUpdate({ args: newArgs });
  }
  
  /**
   *
   * @param {string} argName
   * @param {string|number} index
   * @param {(string|number)[]} where
   * @private
   */
  _handleAddValue({ propName: argName, index, where }) {
    const { field, schema, fieldArgs, onArgsUpdate } = this.props;
  
    let newArgs = fieldArgs || Map();
    const arg = field.args[argName];
    const jssyTypedef = getJssyTypeOfField(arg, schema);
    const nestedTypedef = getNestedTypedef(jssyTypedef, [...where, index]);
    const newValue = staticJssyValueFromJs(makeDefaultValue(nestedTypedef));
    const pathToValue = [argName, 'sourceData', 'value']
      .concat(...where.map(step => [step, 'sourceData', 'value']));
    
    if (index === -1)
      newArgs = newArgs.updateIn(pathToValue, list => list.push(newValue));
    else
      newArgs = newArgs.setIn([...pathToValue, index], newValue);
    
    onArgsUpdate({ args: newArgs });
  }
  
  /**
   *
   * @param {string} argName
   * @param {string|number} index
   * @param {(string|number)[]} where
   * @private
   */
  _handleDeleteValue({ propName: argName, index, where }) {
    const { fieldArgs, onArgsUpdate } = this.props;
  
    let newArgs = fieldArgs || Map();
    const pathToValue = [argName, 'sourceData', 'value']
      .concat(...where.map(step => [step, 'sourceData', 'value']), index);
  
    newArgs = newArgs.deleteIn(pathToValue);
    onArgsUpdate({ args: newArgs });
  }
  
  render() {
    const { field, schema, fieldArgs, getLocalizedText } = this.props;
  
    const items = objectToArray(field.args, (arg, argName) => {
      const jssyTypedef = getJssyTypeOfField(arg, schema);
      const jssyValue = fieldArgs ? fieldArgs.get(argName) || null : null;
      const propType = this._getPropTypeForArgument(arg, jssyTypedef, argName);
      const value = this._getValueForArgument(jssyValue, jssyTypedef);
    
      return (
        <Prop
          key={argName}
          propName={argName}
          propType={propType}
          value={value}
          getLocalizedText={getLocalizedText}
          onCheck={this._handleCheck}
          onChange={this._handleUpdateValue}
          onAddValue={this._handleAddValue}
          onDeleteValue={this._handleDeleteValue}
        />
      );
    });
  
    return (
      <PropsList>
        {items}
      </PropsList>
    );
  }
}

DataSelectionArgsEditor.propTypes = propTypes;
DataSelectionArgsEditor.defaultProps = defaultProps;
DataSelectionArgsEditor.displayName = 'DataSelectionArgsEditor';
