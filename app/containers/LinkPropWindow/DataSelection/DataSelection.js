/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Button } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
  BlockContentBoxGroup,
  BlockContentNavigation,
  BlockBreadcrumbs,
  BlockContentActions,
  BlockContentActionsRegion,
} from '../../../components/BlockContent/BlockContent';

import {
  DataWindowTitle,
  DataWindowHeadingButtons,
  DataWindowContentGroup,
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
  getFieldsByPath,
} from '../../../utils/schema';

import {
  returnArg,
  noop,
  objectSome,
} from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  dataContext: PropTypes.arrayOf(PropTypes.string).isRequired,
  schema: PropTypes.object.isRequired,
  rootTypeName: PropTypes.string.isRequired,
  userTypedefs: PropTypes.object.isRequired,
  linkTargetValueDef: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func,
  onSelect: PropTypes.func,
  onReturn: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onSelect: noop,
  onReturn: noop,
};

const Views = {
  FIELDS_LIST: 0,
  ARGS_FORM: 1,
  FULL_ARGS_FORM: 2,
};

export class DataSelection extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      currentView: Views.FIELDS_LIST,
      
      // For FIELDS_LIST view
      currentTypeName: props.rootTypeName,
      currentPath: [],
      
      // For ARGS_FORM view
      argumentsFieldName: '',
      argumentsPathToField: [],
      argumentsField: null,
  
      // For FULL_ARGS_FORM view
      finalFieldName: '',
      
      // For ARGS_FORM and FULL_ARGS_FORM views
      currentArgValues: Map(),
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
    this._handleCurrentArgsUpdate =
      this._handleCurrentArgsUpdate.bind(this);
    this._handleApplyLink =
      this._handleApplyLink.bind(this);
    this._handleFullArgumentsFormApply =
      this._handleFullArgumentsFormApply.bind(this);
  }
  
  /**
   *
   * @return {{ title: string }[]}
   * @private
   */
  _getBreadcrumbsItems() {
    const { dataContext, rootTypeName } = this.props;
    
    // TODO: Get strings from i18n
    const firstItemTitle = dataContext.length > 0
      ? `Context - ${rootTypeName}`
      : 'Data';
    
    return [{ title: 'Sources' }, { title: firstItemTitle }]
      .concat(this.state.currentPath.map(fieldName => ({ title: fieldName })));
  }
  
  /**
   *
   * @return {?DataField}
   * @private
   */
  _getCurrentField() {
    const { schema, rootTypeName } = this.props;
    const { currentPath } = this.state;
    
    if (currentPath.length === 0) return null;
  
    const prevTypeName = getTypeNameByPath(
      schema,
      currentPath.slice(0, -1),
      rootTypeName,
    );
    
    const currentFieldName = currentPath[currentPath.length - 1];
  
    return schema.types[prevTypeName].fields[currentFieldName];
  }
  
  /**
   *
   * @param {string[]} path
   * @param {Immutable.Map<string, Immutable.Map<string, Object>>} argValues
   * @return {boolean}
   * @private
   */
  _haveUndefinedRequiredArgs(path, argValues) {
    const { schema, rootTypeName } = this.props;
    
    const fields = getFieldsByPath(schema, path, rootTypeName);
    
    return fields.some((field, idx) => {
      const args = field.args;
      const valuesKey = path.slice(0, idx + 1).join(' ');
      const values = argValues.get(valuesKey);
      
      return objectSome(args, (arg, argName) =>
        arg.nonNull && (!values || !values.get(argName)));
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
    const { currentArgValues } = this.state;
    
    this.setState({
      currentView: Views.ARGS_FORM,
      argumentsFieldName: fieldName,
      argumentsField: field,
      argumentsPathToField: pathToField,
      tmpArgValues: currentArgValues,
    });
  }
  
  /**
   *
   * @private
   */
  _switchToFullArgumentsForm(finalFieldName) {
    const { currentArgValues } = this.state;
    
    this.setState({
      currentView: Views.FULL_ARGS_FORM,
      tmpArgValues: currentArgValues,
      finalFieldName,
    });
  }
  
  _apply(finalFieldName, argValues) {
    const { dataContext, onSelect } = this.props;
    const { currentPath } = this.state;
    
    onSelect({
      dataContext,
      path: [...currentPath, finalFieldName],
      args: argValues,
    });
  }
  
  /**
   *
   * @private
   */
  _handleFullArgumentsFormApply() {
    const { currentPath, finalFieldName, tmpArgValues } = this.state;
    const fullPath = [...currentPath, finalFieldName];
    
    if (this._haveUndefinedRequiredArgs(fullPath, tmpArgValues)) {
      // TODO: Scroll to the first invalid field and show red messages
    } else {
      this._apply(finalFieldName, tmpArgValues);
    }
  }
  
  /**
   *
   * @param {number} index
   * @private
   */
  _handleBreadcrumbsClick({ index }) {
    const { schema, onReturn } = this.props;
    const { currentPath } = this.state;
    
    if (index === currentPath.length + 1) return;
    
    if (index > 0) {
      const nextPath = currentPath.slice(0, index - 1);
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
  _handleCurrentArgsUpdate({ args }) {
    const { argumentsPathToField, tmpArgValues } = this.state;
    
    this.setState({
      tmpArgValues: tmpArgValues.set(argumentsPathToField.join(' '), args),
    });
  }
  
  /**
   *
   * @param {string[]} pathToField
   * @param {Object} args
   * @private
   */
  _handleArgsUpdate({ pathToField, args }) {
    const { tmpArgValues } = this.state;
    
    this.setState({
      tmpArgValues: tmpArgValues.set(pathToField.join(' '), args),
    });
  }
  
  /**
   *
   * @private
   */
  _handleCancelSetArguments() {
    this.setState({
      currentView: Views.FIELDS_LIST,
      argumentsFieldName: '',
      argumentsField: null,
      argumentsPathToField: [],
      tmpArgValues: null,
      finalFieldName: '',
    });
  }
  
  /**
   *
   * @private
   */
  _handleApplyArguments() {
    this.setState({
      currentView: Views.FIELDS_LIST,
      argumentsFieldName: '',
      argumentsField: null,
      argumentsPathToField: [],
      currentArgValues: this.state.tmpArgValues,
      tmpArgValues: null,
    });
  }
  
  _handleApplyLink({ fieldName }) {
    const { currentPath, currentArgValues } = this.state;
    const fullPath = [...currentPath, fieldName];
    
    if (this._haveUndefinedRequiredArgs(fullPath, currentArgValues))
      this._switchToFullArgumentsForm(fieldName);
    else
      this._apply(fieldName, currentArgValues);
  }
  
  _renderFieldSelection() {
    const {
      schema,
      getLocalizedText,
      linkTargetValueDef,
      userTypedefs,
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
        <BlockContentBoxGroup colorScheme="dim">
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
              linkTargetTypedef={linkTargetValueDef}
              linkTargetUserTypedefs={userTypedefs}
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
    const backText = getLocalizedText('common.back');
    const applyText = getLocalizedText('common.apply');
    const fieldArgs = tmpArgValues.get(argumentsPathToField.join(' ')) || null;
    
    return (
      <BlockContent>
        <BlockContentBox isBordered flex>
          <BlockContentBoxGroup colorScheme="dim">
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
              onArgsUpdate={this._handleCurrentArgsUpdate}
            />
          </BlockContentBoxItem>
        </BlockContentBox>
        
        <BlockContentActions>
          <BlockContentActionsRegion type="main">
            <Button
              text={backText}
              icon="chevron-left"
              onPress={this._handleCancelSetArguments}
            />
            <Button
              text={applyText}
              onPress={this._handleApplyArguments}
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }
  
  _renderFullArgumentsForm() {
    const { schema, rootTypeName, getLocalizedText } = this.props;
    const { currentPath, finalFieldName, tmpArgValues } = this.state;
    
    const fullPath = [...currentPath, finalFieldName];
    const fields = getFieldsByPath(schema, fullPath, rootTypeName);
    
    const contentGroups = fields
      .filter(fieldHasArguments)
      .map((field, idx) => {
        const fieldName = fullPath[idx];
        const pathToField = fullPath.slice(0, idx + 1);
        const valuesKey = pathToField.join(' ');
        const values = tmpArgValues.get(valuesKey) || null;
        
        const onArgsUpdate = ({ args }) =>
          void this._handleArgsUpdate({ pathToField, args });
        
        return (
          <DataWindowContentGroup key={fieldName} title={fieldName}>
            <DataSelectionArgsEditor
              field={field}
              schema={schema}
              fieldArgs={values}
              getLocalizedText={getLocalizedText}
              onArgsUpdate={onArgsUpdate}
            />
          </DataWindowContentGroup>
        );
      });
  
    const titleText = getLocalizedText('allArguments');
    const subtitleText = getLocalizedText('pleaseFillAllRequiredArguments');
    const applyText = getLocalizedText('common.apply');
    const backText = getLocalizedText('common.back');
    
    return (
      <BlockContent>
        <BlockContentBox isBordered flex>
          <BlockContentBoxGroup colorScheme="dim">
            <BlockContentBoxItem>
              <DataWindowTitle
                title={titleText}
                subtitle={subtitleText}
              />
            </BlockContentBoxItem>
          </BlockContentBoxGroup>
  
          <BlockContentBoxItem>
            {contentGroups}
          </BlockContentBoxItem>
        </BlockContentBox>
  
        <BlockContentActions>
          <BlockContentActionsRegion type="main">
            <Button
              text={backText}
              icon="chevron-left"
              onPress={this._handleCancelSetArguments}
            />
            <Button
              text={applyText}
              onPress={this._handleFullArgumentsFormApply}
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }
  
  render() {
    switch (this.state.currentView) {
      case Views.FIELDS_LIST: return this._renderFieldSelection();
      case Views.ARGS_FORM: return this._renderArgumentsForm();
      case Views.FULL_ARGS_FORM: return this._renderFullArgumentsForm();
      default: return null;
    }
  }
}

DataSelection.propTypes = propTypes;
DataSelection.defaultProps = defaultProps;
DataSelection.displayName = 'DataSelection';
