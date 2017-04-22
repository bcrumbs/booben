/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TypeNames } from '@jssy/types';
import { Button } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxHeading,
  BlockContentBoxItem,
  BlockContentActions,
  BlockContentActionsRegion,
} from '../../../../components/BlockContent/BlockContent';

import { DataWindowTitle } from '../../../../components/DataWindow/DataWindow';

import {
  PropEmpty,
  PropInput,
  PropTextarea,
  PropList,
} from '../../../../components/props';

import { PropsList } from '../../../../components/PropsList/PropsList';

import {
  FunctionArgumentNew,
} from './FunctionArgumentNew/FunctionArgumentNew';

import {
  FunctionAddArgumentButton,
} from './FunctionAddArgumentButton/FunctionAddArgumentButton';

import {
  FunctionEditor,
} from '../../../../components/FunctionEditor/FunctionEditor';

import { functionNameFromTitle } from '../../../../utils/functions';
import { noop, returnArg } from '../../../../utils/misc';
import './NewFunctionWindow.scss';

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
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      view: Views.DEFINITION,
      title: '',
      description: '',
      returnType: TypeNames.STRING,
      args: [],
      code: '',
      creatingNewArgument: false,
    };
    
    this._handleTitleChange = this._handleTitleChange.bind(this);
    this._handleDescriptionChange = this._handleDescriptionChange.bind(this);
    this._handleReturnTypeChange = this._handleReturnTypeChange.bind(this);
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
    this._handleCancelAddArgument = this._handleCancelAddArgument.bind(this);
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
  
  _handleAddButtonPress() {
    this.setState({ creatingNewArgument: true });
  }
  
  _handleCancelAddArgument() {
    this.setState({ creatingNewArgument: false });
  }
  
  _handleAddArg(arg) {
    const { args } = this.state;
    this.setState({ args: [...args, arg], creatingNewArgument: false });
  }
  
  _handleDeleteArg({ id }) {
    const { args } = this.state;
    const idx = parseInt(id, 10);
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
    
    const {
      title,
      description,
      returnType,
      args,
      creatingNewArgument,
    } = this.state;
    
    const typeSelectOptions = this._getTypeSelectOptions();
    const isNextButtonDisabled = this._isNextButtonDisabled();
    
    let newArgumentButton = null;
    if (!creatingNewArgument) {
      newArgumentButton = (
        <FunctionAddArgumentButton
          getLocalizedText={getLocalizedText}
          onPress={this._handleAddButtonPress}
        />
      );
    }
    
    let newArgumentForm = null;
    if (creatingNewArgument) {
      newArgumentForm = (
        <FunctionArgumentNew
          existingArgNames={args.map(item => item.name)}
          getLocalizedText={getLocalizedText}
          onAdd={this._handleAddArg}
          onCancel={this._handleCancelAddArgument}
        />
      );
    }
  
    let argsList = null;
    if (args.length > 0) {
      const list = args.map(({ name, type }, idx) => (
        <PropEmpty
          key={name}
          id={String(idx)}
          label={name}
          secondaryLabel={getLocalizedText(`types.${type}`)}
          deletable
          onDelete={this._handleDeleteArg}
        />
      ));
    
      argsList = (
        <PropsList>
          {list}
        </PropsList>
      );
    }
    
    return (
      <BlockContent>
        <BlockContentBox>
          <BlockContentBoxItem isBordered>
            <DataWindowTitle
              title={getLocalizedText('linkDialog.function.new.windowTitle')}
            />
          </BlockContentBoxItem>
          
          <BlockContentBoxItem>
            <PropInput
              label={getLocalizedText('linkDialog.function.new.title')}
              value={title}
              onChange={this._handleTitleChange}
            />
            
            <PropTextarea
              label={getLocalizedText('linkDialog.function.new.desc')}
              value={description}
              onChange={this._handleDescriptionChange}
            />
            
            <PropList
              label={getLocalizedText('linkDialog.function.new.returnType')}
              value={returnType}
              options={typeSelectOptions}
              onChange={this._handleReturnTypeChange}
            />
          </BlockContentBoxItem>
          
          <BlockContentBoxHeading>
            {getLocalizedText('linkDialog.function.new.argsList')}
          </BlockContentBoxHeading>
          
          <BlockContentBoxItem>
            {argsList}
            {newArgumentButton}
          </BlockContentBoxItem>
          
          {newArgumentForm}
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
              icon="chevron-left"
              onPress={this._handleBack}
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
