/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
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
  DataWindowTitle,
  DataWindowHeadingButtons,
} from '../../../components/DataWindow/DataWindow';

import {
  DataSelectionFieldsList,
} from './DataSelectionFieldsList/DataSelectionFieldsList';

import {
  DataSelectionArgsEditor,
} from './DataSelectionArgsEditor/DataSelectionArgsEditor';

import {
  getTypeNameByField,
  getTypeNameByPath,
  fieldHasArguments,
} from '../../../utils/schema';

import {
  returnArg,
  noop,
  objectSome,
} from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  schema: PropTypes.object.isRequired,
  rootTypeName: PropTypes.string.isRequired,
  argValues: PropTypes.object.isRequired,
  linkTargetComponentMeta: PropTypes.object.isRequired,
  linkTargetPropTypedef: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func,
  onSelect: PropTypes.func,
  onReturn: PropTypes.func,
  onReplaceButtons: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onSelect: noop,
  onReturn: noop,
  onReplaceButtons: noop,
};

export class DataSelection extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      currentTypeName: props.rootTypeName,
      currentPath: [],
      settingArguments: false,
      argumentsFieldName: '',
      argumentsPathToField: [],
      argumentsField: null,
      currentArgValues: props.argValues,
      tmpArgValues: null,
    };
    
    this._handleBreadcrumbsClick =
      this._handleBreadcrumbsClick.bind(this);
    this._handleJumpIntoField =
      this._handleJumpIntoField.bind(this);
    this._handleSetArgumentsOnCurrentField =
      this._handleSetArgumentsOnCurrentField.bind(this);
    this._handleSetArgumentsOnDataItem =
      this._handleSetArgumentsOnDataItem.bind(this);
    this._handleCancelSetArguments =
      this._handleCancelSetArguments.bind(this);
    this._handleApplyArguments =
      this._handleApplyArguments.bind(this);
    this._handleArgsUpdate =
      this._handleArgsUpdate.bind(this);
    this._handleApplyLink =
      this._handleApplyLink.bind(this);
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
  _handleJumpIntoField({ fieldName }) {
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
      tmpArgValues: this.state.currentArgValues,
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
  _handleSetArgumentsOnDataItem({ fieldName }) {
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
   * @param {Object} args
   * @private
   */
  _handleArgsUpdate({ args }) {
    const { argumentsPathToField, tmpArgValues } = this.state;
    
    this.setState({
      tmpArgValues: tmpArgValues.set(argumentsPathToField.join(' '), args),
    });
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
   * @return {boolean}
   * @private
   */
  _haveUndefinedRequiredArgs() {
    const { schema, rootTypeName } = this.props;
    const { currentPath, currentArgValues } = this.state;
    
    let currentType = schema.types[rootTypeName],
      i = 0;
    
    while (i < currentPath.length) {
      const field = currentType.fields[currentPath[i]];
      const args = field.args;
      const argValues = currentArgValues.get(currentPath.slice(0, i + 1));
      const haveUndefinedRequiredArgs = objectSome(
        args,
        (arg, argName) =>
          arg.nonNull && (
            !argValues ||
            !argValues.get(argName)
          ),
      );
      
      if (haveUndefinedRequiredArgs) return true;
      
      i++;
      currentType = schema.types[field.type];
    }
    
    return false;
  }
  
  _handleApplyLink() {
    const { onSelect } = this.props;
    const { currentPath, currentArgValues } = this.state;
    
    if (this._haveUndefinedRequiredArgs()) {
      // TODO: Show args editor for all fields
    } else {
      onSelect({
        path: currentPath,
        args: currentArgValues,
      });
    }
  }
  
  _renderFieldSelection() {
    const {
      schema,
      getLocalizedText,
      linkTargetPropTypedef,
      linkTargetComponentMeta,
    } = this.props;
    
    const { currentPath, currentTypeName } = this.state;
    
    /** @type {DataObjectType} */
    const currentType = schema.types[currentTypeName];
    
    const breadCrumbsItems = this._getBreadcrumbsItems();
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
            <DataSelectionFieldsList
              type={currentType}
              schema={schema}
              linkTargetTypedef={linkTargetPropTypedef}
              linkTargetUserTypedefs={linkTargetComponentMeta.types}
              getLocalizedText={getLocalizedText}
              onJumpIntoField={this._handleJumpIntoField}
              onSetFieldArguments={this._handleSetArgumentsOnDataItem}
              onApply={this._handleApplyLink}
            />
          </BlockContentBoxItem>
        </BlockContentBox>
      </BlockContent>
    );
  }
  
  _renderArgumentsForm() {
    const { schema, getLocalizedText } = this.props;
    const {
      argumentsFieldName,
      argumentsField,
      argumentsPathToField,
      tmpArgValues,
    } = this.state;
    
    const titleText = getLocalizedText('argumentsForField', {
      name: argumentsFieldName,
    });
    
    const subtitleText = getLocalizedText('pleaseFillAllRequiredArguments');
    const fieldArgs = tmpArgValues.get(argumentsPathToField.join(' ')) || null;
    
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
            <DataSelectionArgsEditor
              field={argumentsField}
              schema={schema}
              fieldArgs={fieldArgs}
              getLocalizedText={getLocalizedText}
              onArgsUpdate={this._handleArgsUpdate}
            />
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
