/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import _forOwn from 'lodash.forown';
import _mapValues from 'lodash.mapvalues';
import { Button } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
  BlockContentBoxGroup,
  BlockContentNavigation,
  BlockBreadcrumbs,
} from '../../../components/BlockContent/BlockContent';

import {
  DataList,
  DataItem,
} from '../../../components/DataList/DataList';

import {
  PropsList,
  Prop,
  jssyTypeToView,
  jssyValueToPropValue,
} from '../../../components/PropsList/PropsList';

import {
  DataWindowTitle,
  DataWindowHeadingButtons,
} from '../../../components/DataWindow/DataWindow';

import { isCompatibleType } from '../../../../shared/types';

import {
  FieldKinds,
  getJssyTypeOfField,
  getTypeNameByField,
  getTypeNameByPath,
  fieldHasArguments,
} from '../../../utils/schema';

import {
  returnArg,
  noop,
  objectSome,
  objectToArray,
} from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  schema: PropTypes.object.isRequired,
  rootTypeName: PropTypes.string.isRequired,
  argValues: PropTypes.object.isRequired,
  linkTargetComponentMeta: PropTypes.object.isRequired,
  linkTargetPropTypedef: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func,
  onReturn: PropTypes.func,
  onReplaceButtons: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onReturn: noop,
  onReplaceButtons: noop,
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

const fieldHasCompatibleSubFields = (
  fieldJssyTypedef,
  linkTargetPropTypedef,
  linkTargetComponentMeta,
  failedTypedefs = new Set(),
) => {
  if (fieldJssyTypedef.type !== 'shape') return false;
  
  return objectSome(fieldJssyTypedef.fields, fieldTypedef => {
    const isCompatible = isCompatibleType(
      linkTargetPropTypedef,
      fieldTypedef,
      linkTargetComponentMeta.types,
      {},
    );
    
    if (isCompatible) return true;
    
    // failedTypedefs set is used to take care of possible circular references
    // that can be present in typedefs generated from GraphQL schemas
    if (failedTypedefs.has(fieldTypedef)) return false;
    failedTypedefs.add(fieldTypedef);
    
    return fieldHasCompatibleSubFields(
      fieldTypedef,
      linkTargetPropTypedef,
      linkTargetComponentMeta,
      failedTypedefs,
    );
  });
};

const getFieldCompatibility = (
  jssyType,
  linkTargetPropTypedef,
  linkTargetComponentMeta,
) => {
  const isCompatible = isCompatibleType(
    linkTargetPropTypedef,
    jssyType,
    linkTargetComponentMeta.types,
    {},
  );
  
  const hasCompatibleSubFields = fieldHasCompatibleSubFields(
    jssyType,
    linkTargetPropTypedef,
    linkTargetComponentMeta,
  );
  
  return { isCompatible, hasCompatibleSubFields };
};

export class DataSelection extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      currentTypeName: props.rootTypeName,
      currentPath: [],
      selectedField: null,
      settingArguments: false,
      argumentsFieldName: '',
      argumentsPathToField: [],
      argumentsField: null,
      currentArgValues: props.argValues,
      tmpArgValues: null,
    };
    
    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleFieldJumpInto = this._handleFieldJumpInto.bind(this);
    this._handleFieldSelect = this._handleFieldSelect.bind(this);
    this._handleSetArgumentsOnCurrentField =
      this._handleSetArgumentsOnCurrentField.bind(this);
    this._handleSetArgumentsOnDataItem =
      this._handleSetArgumentsOnDataItem.bind(this);
    this._handleCancelSetArguments = this._handleCancelSetArguments.bind(this);
    this._handleApplyArguments = this._handleApplyArguments.bind(this);
  }
  
  /**
   *
   * @return {{ title: string }[]}
   * @private
   */
  _getBreadcrumbsItems() {
    // TODO: Get strings from i18n
    return [{ title: 'Sources' }, { title: 'Data' }]
      .concat(this.state.currentPath.map(fieldName => ({ title: fieldName })));
  }
  
  /**
   *
   * @return {?DataField}
   * @private
   */
  _getCurrentField() {
    const { schema } = this.props;
    const { currentPath } = this.state;
    
    if (currentPath.length > 0) {
      const prevTypeName = getTypeNameByPath(schema, currentPath.slice(0, -1));
      const currentFieldName = currentPath[currentPath.length - 1];
  
      return schema.types[prevTypeName].fields[currentFieldName];
    } else {
      return null;
    }
  }
  
  /**
   *
   * @param {DataField} field
   * @return {string}
   * @private
   */
  _formatFieldType(field) {
    // TODO: Get strings from i18n
    
    if (field.kind === FieldKinds.LIST)
      return `List of ${field.type}`;
    
    if (field.kind === FieldKinds.CONNECTION)
      return `Connection to ${field.type}`;
    
    return field.type;
  }
  
  /**
   *
   * @param {number} itemIndex
   * @private
   */
  _handleBreadcrumbsClick(itemIndex) {
    const { schema, onReturn } = this.props;
    const { currentPath } = this.state;
    
    if (itemIndex === currentPath.length + 1) return;
    
    if (itemIndex > 0) {
      const nextPath = currentPath.slice(0, itemIndex - 1);
      const nextTypeName = getTypeNameByPath(schema, nextPath);
      
      this.setState({
        currentPath: nextPath,
        currentTypeName: nextTypeName,
      });
    } else {
      onReturn();
    }
  }
  
  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleFieldJumpInto({ id: fieldName }) {
    const { schema } = this.props;
    const { currentPath, currentTypeName } = this.state;
    
    const nextPath = currentPath.concat(fieldName);
    const nextTypeName = getTypeNameByField(schema, fieldName, currentTypeName);
    
    this.setState({
      currentPath: nextPath,
      currentTypeName: nextTypeName,
    });
  }
  
  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleFieldSelect({ id: fieldName }) {
    this.setState({
      selectedField: fieldName,
    });
  }
  
  /**
   *
   * @param {string} fieldName
   * @param {DataField} field
   * @param {string[]} pathToField
   * @private
   */
  _switchToArgumentsForm(fieldName, field, pathToField) {
    // TODO: Get strings from i18n
    
    this.props.onReplaceButtons({
      buttons: [{
        text: 'Back',
        icon: 'chevron-left',
        onPress: this._handleCancelSetArguments,
      }, {
        text: 'Apply',
        onPress: this._handleApplyArguments,
      }],
    });
    
    this.setState({
      settingArguments: true,
      argumentsFieldName: fieldName,
      argumentsField: field,
      argumentsPathToField: pathToField,
      tmpArgValues: this.state.currentArgValues, // TODO: Create default values for missing args
    });
  }
  
  /**
   *
   * @private
   */
  _handleSetArgumentsOnCurrentField() {
    const { currentPath } = this.state;
    
    const currentFieldName = currentPath[currentPath.length - 1];
    const currentField = this._getCurrentField();
    
    this._switchToArgumentsForm(
      currentFieldName,
      currentField,
      [].concat(currentPath),
    );
  }
  
  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleSetArgumentsOnDataItem({ id: fieldName }) {
    const { schema } = this.props;
    const { currentPath, currentTypeName } = this.state;
    
    const field = schema.types[currentTypeName].fields[fieldName];
    
    this._switchToArgumentsForm(
      fieldName,
      field,
      [].concat(currentPath, fieldName),
    );
  }
  
  /**
   *
   * @private
   */
  _handleCancelSetArguments() {
    this.props.onReplaceButtons({ buttons: [] });
    
    this.setState({
      settingArguments: false,
      argumentsFieldName: '',
      argumentsField: null,
      argumentsPathToField: [],
      tmpArgValues: null,
    });
  }
  
  /**
   *
   * @private
   */
  _handleApplyArguments() {
    this.props.onReplaceButtons({ buttons: [] });
  
    this.setState({
      settingArguments: false,
      argumentsFieldName: '',
      argumentsField: null,
      argumentsPathToField: [],
      currentArgValues: this.state.tmpArgValues,
    });
  }
  
  /**
   *
   * @param {string} fieldName
   * @param {DataField} field
   * @param {boolean} isCompatible
   * @param {boolean} hasCompatibleSubFields
   * @return {?ReactElement}
   * @private
   */
  _renderField(fieldName, field, isCompatible, hasCompatibleSubFields) {
    const { getLocalizedText } = this.props;
    const { selectedField } = this.state;
  
    const fieldType = this._formatFieldType(field);
    const selected = fieldName === selectedField;
    const hasApplyButton = selected && isCompatible;
    const hasArgsButton = selected && fieldHasArguments(field);
    
    //noinspection JSValidateTypes
    return (
      <DataItem
        key={fieldName}
        id={fieldName}
        title={fieldName}
        tooltip={field.description}
        type={fieldType}
        selected={selected}
        canBeApplied={hasApplyButton}
        argsButton={hasArgsButton}
        connection={hasCompatibleSubFields}
        getLocalizedText={getLocalizedText}
        onJumpIntoClick={this._handleFieldJumpInto}
        onSelect={this._handleFieldSelect}
        onSetArgumentsClick={this._handleSetArgumentsOnDataItem}
      />
    );
  }
  
  /**
   *
   * @param {DataObjectType} type
   * @return {ReactElement}
   * @private
   */
  _renderFieldsList(type) {
    const {
      schema,
      linkTargetPropTypedef,
      linkTargetComponentMeta,
    } = this.props;
    
    const items = [];
    
    _forOwn(type.fields, (field, fieldName) => {
      const jssyType = getJssyTypeOfField(field, schema);
      
      const { isCompatible, hasCompatibleSubFields } = getFieldCompatibility(
        jssyType,
        linkTargetPropTypedef,
        linkTargetComponentMeta,
      );
      
      if (!isCompatible && !hasCompatibleSubFields) return;
      
      items.push(this._renderField(
        fieldName,
        field,
        isCompatible,
        hasCompatibleSubFields,
      ));
      
      if (!field.connectionFields) return;
      
      _forOwn(field.connectionFields, (connField, connFieldName) => {
        const fullName = `${fieldName}/${connFieldName}`;
        const connFieldJssyType = getJssyTypeOfField(connField, schema);
    
        const {
          isCompatible,
          hasCompatibleSubFields,
        } = getFieldCompatibility(
          connFieldJssyType,
          linkTargetPropTypedef,
          linkTargetComponentMeta,
        );
    
        if (!isCompatible && !hasCompatibleSubFields) return;
    
        items.push(this._renderField(
          fullName,
          connField,
          isCompatible,
          hasCompatibleSubFields,
        ));
      });
    });
    
    //noinspection JSValidateTypes
    return (
      <DataList>
        {items}
      </DataList>
    );
  }
  
  _renderFieldSelection() {
    const { schema, getLocalizedText } = this.props;
    const { currentPath, currentTypeName } = this.state;
    
    /** @type {DataObjectType} */
    const currentType = schema.types[currentTypeName];
    
    const breadCrumbsItems = this._getBreadcrumbsItems();
    const fieldsList = this._renderFieldsList(currentType);
    let dataWindowHeading = null;
    let fieldsHeading = null;
    
    if (currentPath.length > 0) {
      const currentFieldName = currentPath[currentPath.length - 1];
      const currentField = this._getCurrentField();
      const currentFieldHasArgs = fieldHasArguments(currentField);
      const setArgumentsText = getLocalizedText('setArguments');
      const fieldsText = getLocalizedText('fields');
      let buttons = null;
      
      if (currentFieldHasArgs) {
        buttons = (
          <BlockContentBoxItem>
            <DataWindowHeadingButtons>
              <Button
                text={setArgumentsText}
                narrow
                onPress={this._handleSetArgumentsOnCurrentField}
              />
            </DataWindowHeadingButtons>
          </BlockContentBoxItem>
        );
      }
      
      dataWindowHeading = (
        <BlockContentBoxGroup dim>
          <BlockContentBoxItem>
            <DataWindowTitle
              title={currentFieldName}
              type={currentType.name}
              subtitle={currentType.description}
            />
          </BlockContentBoxItem>
          
          {buttons}
        </BlockContentBoxGroup>
      );
  
      fieldsHeading = (
        <BlockContentBoxHeading>
          {fieldsText}
        </BlockContentBoxHeading>
      );
    }
    
    return (
      <BlockContent>
        <BlockContentNavigation isBordered>
          <BlockBreadcrumbs
            items={breadCrumbsItems}
            mode="dark"
            overflow
            onItemClick={this._handleBreadcrumbsClick}
          />
        </BlockContentNavigation>
        
        <BlockContentBox isBordered flex>
          {dataWindowHeading}
          {fieldsHeading}
  
          <BlockContentBoxItem>
            {fieldsList}
          </BlockContentBoxItem>
        </BlockContentBox>
      </BlockContent>
    );
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
   * @param {DataField} field
   * @return {ReactElement}
   * @private
   */
  _renderArgumentsList(field) {
    const { schema, getLocalizedText } = this.props;
    const { argumentsPathToField, tmpArgValues } = this.state;
    
    const argValuesForField = tmpArgValues.get(argumentsPathToField.join(' '));
    
    const items = objectToArray(field.args, (arg, argName) => {
      const jssyTypedef = getJssyTypeOfField(arg, schema);
      const propType = this._getPropTypeForArgument(arg, jssyTypedef, argName);
      // TODO: Make value for Prop
      
      return (
        <Prop
          key={argName}
          propName={argName}
          propType={propType}
          value={{}}
          getLocalizedText={getLocalizedText}
        />
      );
    });
    
    return (
      <PropsList>
        {items}
      </PropsList>
    );
  }
  
  _renderArgumentsForm() {
    const { getLocalizedText } = this.props;
    const { argumentsFieldName, argumentsField } = this.state;
    
    const titleText = getLocalizedText('argumentsForField', {
      name: argumentsFieldName,
    });
    
    const subtitleText = getLocalizedText('pleaseFillAllRequiredArguments');
    const argsList = this._renderArgumentsList(argumentsField);
    
    return (
      <BlockContent>
        <BlockContentBox isBordered flex>
          <BlockContentBoxGroup dim>
            <BlockContentBoxItem>
              <DataWindowTitle
                title={titleText}
                subtitle={subtitleText}
              />
            </BlockContentBoxItem>
          </BlockContentBoxGroup>
  
          <BlockContentBoxItem>
            {argsList}
          </BlockContentBoxItem>
        </BlockContentBox>
      </BlockContent>
    );
  }
  
  render() {
    return this.state.settingArguments
      ? this._renderArgumentsForm()
      : this._renderFieldSelection();
  }
}

DataSelection.propTypes = propTypes;
DataSelection.defaultProps = defaultProps;
DataSelection.displayName = 'DataSelection';
