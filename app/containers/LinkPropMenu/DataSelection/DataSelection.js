/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import _forOwn from 'lodash.forown';
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

import { returnArg, objectSome, noop } from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  schema: PropTypes.object.isRequired,
  rootTypeName: PropTypes.string.isRequired,
  linkTargetComponentMeta: PropTypes.object.isRequired,
  linkTargetPropTypedef: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func,
  onReturn: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onReturn: noop,
};

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
    };
    
    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleFieldJumpInto = this._handleFieldJumpInto.bind(this);
    this._handleFieldSelect = this._handleFieldSelect.bind(this);
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
      />
    );
  }
  
  /**
   *
   * @param {DataObjectType} type
   * @return {ReactElement[]}
   * @private
   */
  _renderFields(type) {
    const {
      schema,
      linkTargetPropTypedef,
      linkTargetComponentMeta,
    } = this.props;
    
    const ret = [];
    
    _forOwn(type.fields, (field, fieldName) => {
      const jssyType = getJssyTypeOfField(field, schema);
      
      const { isCompatible, hasCompatibleSubFields } = getFieldCompatibility(
        jssyType,
        linkTargetPropTypedef,
        linkTargetComponentMeta,
      );
      
      if (!isCompatible && !hasCompatibleSubFields) return;
      
      ret.push(this._renderField(
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
    
        ret.push(this._renderField(
          fullName,
          connField,
          isCompatible,
          hasCompatibleSubFields,
        ));
      });
    });
    
    return ret;
  }
  
  render() {
    const { schema, getLocalizedText } = this.props;
    const { currentPath, currentTypeName } = this.state;
    
    /** @type {DataObjectType} */
    const currentType = schema.types[currentTypeName];
    
    const breadCrumbsItems = this._getBreadcrumbsItems();
    const fieldsList = this._renderFields(currentType);
    let dataWindowHeading = null;
    let fieldsHeading = null;
    
    if (currentPath.length > 0) {
      const prevTypeName = getTypeNameByPath(schema, currentPath.slice(0, -1));
      const currentFieldName = currentPath[currentPath.length - 1];
      const currentField = schema.types[prevTypeName].fields[currentFieldName];
      const currentFieldHasArgs = fieldHasArguments(currentField);
      const setArgumentsText = getLocalizedText('setArguments');
      const fieldsText = getLocalizedText('fields');
      let buttons = null;
      
      if (currentFieldHasArgs) {
        buttons = (
          <BlockContentBoxItem>
            <DataWindowHeadingButtons>
              <Button text={setArgumentsText} narrow />
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
            <DataList>
              {fieldsList}
            </DataList>
          </BlockContentBoxItem>
        </BlockContentBox>
      </BlockContent>
    );
  }
}

DataSelection.propTypes = propTypes;
DataSelection.defaultProps = defaultProps;
DataSelection.displayName = 'DataSelection';
