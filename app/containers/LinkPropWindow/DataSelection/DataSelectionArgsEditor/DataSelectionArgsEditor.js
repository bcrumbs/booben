/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Map } from 'immutable';

import {
  makeDefaultValue,
  makeDefaultNonNullValue,
  getNestedTypedef,
} from '@jssy/types';

import {
  PropsList,
  Prop,
  jssyValueToPropValue,
  jssyTypedefToPropType,
} from '../../../../components/PropsList/PropsList';

import JssyValue from '../../../../models/JssyValue';
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
   * @param {JssyTypeDefinition} jssyTypedef
   * @param {string} [name='']
   * @return {PropsItemPropType}
   * @private
   */
  _getPropTypeForArgument(dataFieldTypedef, jssyTypedef, name = '') {
    const { schema } = this.props;
    
    const getNestedExtra = (
      jssyTypedef,
      { dataFieldTypedef },
      isField,
      fieldName,
    ) => {
      if (isField) {
        const dataType = schema.types[dataFieldTypedef.type];
        return {
          dataFieldTypedef: dataType.fields[fieldName],
          name: fieldName,
        };
      } else {
        return { dataFieldTypedef, name: '' };
      }
    };
    
    const applyExtra = (propType, { dataFieldTypedef, name }, jssyTypedef) => {
      propType.label = name;
      propType.tooltip = dataFieldTypedef.description;
      propType.checkable = !dataFieldTypedef.nonNull;
      propType.required = dataFieldTypedef.nonNull;
      
      if (jssyTypedef.type === 'arrayOf')
        propType.formatItemLabel = formatArrayItemLabel;
      
      return propType;
    };
    
    return jssyTypedefToPropType(
      jssyTypedef,
      { dataFieldTypedef, name },
      getNestedExtra,
      applyExtra,
    );
  }
  
  /**
   *
   * @param {Object} jssyValue
   * @param {JssyTypeDefinition} jssyTypedef
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
        value: makeDefaultNonNullValue(jssyTypedef),
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
      
      if (!newArgs.has(argName)) {
        if (path.length === 0) {
          newArgs = newArgs.set(
            argName,
            JssyValue.staticFromJS(makeDefaultNonNullValue(jssyTypedef)),
          );
        }
      } else {
        const nestedTypedef = getNestedTypedef(jssyTypedef, path);
  
        newArgs = newArgs.update(argName, argValue =>
          argValue.replaceStaticValueIn(
            path,
            makeDefaultNonNullValue(nestedTypedef)),
          );
      }
    } else if (path.length === 0) {
      newArgs = newArgs.delete(argName);
    } else {
      newArgs = newArgs.update(argName, argValue =>
        argValue.setInStatic(path, JssyValue.STATIC_NULL));
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
      
      newArgs = newArgs.set(
        argName,
        JssyValue.staticFromJS(makeDefaultNonNullValue(jssyTypedef)),
      );
    }
    
    newArgs = newArgs.update(
      argName,
      argValue => argValue.replaceStaticValueIn(path, value),
    );

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
    
    const arg = field.args[argName];
    const jssyTypedef = getJssyTypeOfField(arg, schema);
    const nestedTypedef = getNestedTypedef(jssyTypedef, [...where, index]);
    
    const newArgs = fieldArgs.update(argName, argValue =>
      argValue.addJSValueInStatic(
        where,
        index,
        makeDefaultValue(nestedTypedef)),
    );
    
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
  
    const newArgs = fieldArgs.update(
      argName,
      argValue => argValue.deleteValueInStatic(where, index),
    );
    
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
