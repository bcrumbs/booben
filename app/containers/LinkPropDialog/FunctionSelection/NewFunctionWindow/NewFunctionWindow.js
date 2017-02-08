/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { TypeNames } from '@jssy/types';
import { Button } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
  BlockContentActions,
  BlockContentActionsRegion,
} from '../../../../components/BlockContent/BlockContent';

import { DataWindowTitle } from '../../../../components/DataWindow/DataWindow';

import {
  PropInput,
  PropTextarea,
  PropList,
} from '../../../../components/props';

import {
  FunctionArgumentsList,
} from '../../../../components/FunctionArgumentsList/FunctionArgumentsList';

import {
  FunctionEditor,
} from '../../../../components/FunctionEditor/FunctionEditor';

import { functionNameFromTitle } from '../../../../utils/functions';
import { noop, returnArg } from '../../../../utils/misc';

const propTypes = {
  existingFunctionNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  getLocalizedText: PropTypes.func,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onCreate: noop,
  onCancel: noop,
};

const without = (array, idx) => {
  const ret = [];
  
  for (let i = 0; i < array.length; i++)
    if (i !== idx) ret.push(array[i]);
  
  return ret;
};

const Views = {
  DEFINITION: 0,
  CODE: 1,
};

export class NewFunctionWindow extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      view: Views.DEFINITION,
      title: '',
      description: '',
      returnType: TypeNames.STRING,
      args: [],
      code: '',
    };
    
    this._handleTitleChange = this._handleTitleChange.bind(this);
    this._handleDescriptionChange = this._handleDescriptionChange.bind(this);
    this._handleReturnTypeChange = this._handleReturnTypeChange.bind(this);
    this._handleAddArg = this._handleAddArg.bind(this);
    this._handleDeleteArg = this._handleDeleteArg.bind(this);
    this._handleCancel = this._handleCancel.bind(this);
    this._handleNext = this._handleNext.bind(this);
    this._handleBack = this._handleBack.bind(this);
    this._handleCreate = this._handleCreate.bind(this);
    this._handleCodeChange = this._handleCodeChange.bind(this);
  }
  
  _getTypeSelectOptions() {
    const { getLocalizedText } = this.props;
    
    return [
      { value: TypeNames.STRING, text: getLocalizedText('types.string') },
      { value: TypeNames.INT, text: getLocalizedText('types.int') },
      { value: TypeNames.FLOAT, text: getLocalizedText('types.float') },
      { value: TypeNames.BOOL, text: getLocalizedText('types.bool') },
    ];
  }
  
  _isNextButtonDisabled() {
    return !this.state.title;
  }
  
  _handleTitleChange({ value }) {
    this.setState({ title: value });
  }
  
  _handleDescriptionChange({ value }) {
    this.setState({ description: value });
  }
  
  _handleReturnTypeChange({ value }) {
    this.setState({ returnType: value });
  }
  
  _handleAddArg(arg) {
    const { args } = this.state;
    this.setState({ args: [...args, arg] });
  }
  
  _handleDeleteArg({ idx }) {
    const { args } = this.state;
    this.setState({ args: without(args, idx) });
  }
  
  _handleCancel() {
    this.props.onCancel();
  }
  
  _handleNext() {
    this.setState({ view: Views.CODE });
  }
  
  _handleBack() {
    this.setState({ view: Views.DEFINITION });
  }
  
  _handleCreate() {
    const { title, description, args, returnType, code } = this.state;
    this.props.onCreate({ title, description, args, returnType, code });
  }
  
  _handleCodeChange(code) {
    this.setState({ code });
  }
  
  _renderDefinitionForm() {
    const { getLocalizedText } = this.props;
    const { title, description, returnType, args } = this.state;
    
    const typeSelectOptions = this._getTypeSelectOptions();
    const isNextButtonDisabled = this._isNextButtonDisabled();
    
    return (
      <BlockContent>
        <BlockContentBox>
          <BlockContentBoxItem isBordered>
            <DataWindowTitle
              title={getLocalizedText('functions.new.windowTitle')}
            />
          </BlockContentBoxItem>
          
          <BlockContentBoxItem>
            <PropInput
              label={getLocalizedText('functions.new.title')}
              value={title}
              onChange={this._handleTitleChange}
            />
            
            <PropTextarea
              label={getLocalizedText('functions.new.desc')}
              value={description}
              onChange={this._handleDescriptionChange}
            />
            
            <PropList
              label={getLocalizedText('functions.new.returnType')}
              value={returnType}
              options={typeSelectOptions}
              onChange={this._handleReturnTypeChange}
            />
          </BlockContentBoxItem>

          <FunctionArgumentsList
            items={args}
            getLocalizedText={getLocalizedText}
            onAdd={this._handleAddArg}
            onDelete={this._handleDeleteArg}
          />

        </BlockContentBox>
        
        <BlockContentActions>
          <BlockContentActionsRegion type="main">
            <Button
              text={getLocalizedText('common.cancel')}
              onPress={this._handleCancel}
            />
            <Button
              text={getLocalizedText('common.next')}
              disabled={isNextButtonDisabled}
              onPress={this._handleNext}
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }
  
  _renderCodeEditor() {
    const { existingFunctionNames, getLocalizedText } = this.props;
    const { title, args, code } = this.state;
    
    const functionName = functionNameFromTitle(title, existingFunctionNames);
    
    return (
      <BlockContent>
        <BlockContentBox isBordered>
          <BlockContentBoxItem blank>
            <FunctionEditor
              name={functionName}
              args={args}
              code={code}
              onChange={this._handleCodeChange}
            />
          </BlockContentBoxItem>
        </BlockContentBox>
  
        <BlockContentActions>
          <BlockContentActionsRegion type="secondary">
            <Button
              text={getLocalizedText('common.back')}
              onPress={this._handleBack}
              icon="chevron-left"
            />
          </BlockContentActionsRegion>
          <BlockContentActionsRegion type="main">
            <Button
              text={getLocalizedText('common.cancel')}
              onPress={this._handleCancel}
            />
            <Button
              text={getLocalizedText('common.create')}
              onPress={this._handleCreate}
            />
          </BlockContentActionsRegion>
        </BlockContentActions>
      </BlockContent>
    );
  }
  
  render() {
    const { view } = this.state;
    
    switch (view) {
      case Views.DEFINITION: return this._renderDefinitionForm();
      case Views.CODE: return this._renderCodeEditor();
      default: return null;
    }
  }
}

NewFunctionWindow.propTypes = propTypes;
NewFunctionWindow.defaultProps = defaultProps;
NewFunctionWindow.displayName = 'NewFunctionWindow';
