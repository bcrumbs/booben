/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { isCompatibleType } from '@jssy/types';
import { FunctionsList } from './FunctionsList/FunctionsList';
import { FunctionWindow } from './FunctionWindow/FunctionWindow';
import { NewFunctionWindow } from './NewFunctionWindow/NewFunctionWindow';

import {
  FunctionSources,
  functionNameFromTitle,
} from '../../../lib/functions';

import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  valueDef: PropTypes.object.isRequired,
  userTypedefs: PropTypes.object,
  projectFunctions: ImmutablePropTypes.map,
  builtinFunctions: ImmutablePropTypes.map,
  getLocalizedText: PropTypes.func,
  onSelect: PropTypes.func,
  onCreateFunction: PropTypes.func,
  onReturn: PropTypes.func,
  onNestedLink: PropTypes.func,
};

const defaultProps = {
  userTypedefs: null,
  projectFunctions: {},
  builtinFunctions: {},
  getLocalizedText: returnArg,
  onSelect: noop,
  onCreateFunction: noop,
  onReturn: noop,
  onNestedLink: noop,
};

const Views = {
  LIST: 0,
  FUNCTION: 1,
  ADD: 2,
};

export class FunctionSelection extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      currentView: Views.LIST,
      
      selectedFunctionId: '',
      selectedFunctionSource: '',
      
      newFunctionTitle: '',
      newFunctionDesc: '',
      newFunctionReturnType: '',
      newFunctionArgs: [],
    };

    this._handleReturn = this._handleReturn.bind(this);
    this._handleReturnToList = this._handleReturnToList.bind(this);
    this._handleAddFunction = this._handleAddFunction.bind(this);
    this._handleSelectFunction = this._handleSelectFunction.bind(this);
    this._handleApply = this._handleApply.bind(this);
    this._handleCreate = this._handleCreate.bind(this);
  }

  _handleReturn() {
    this.props.onReturn();
  }
  
  _handleReturnToList() {
    this.setState({
      currentView: Views.LIST,
      selectedFunctionId: '',
      selectedFunctionSource: '',
    });
  }

  _handleAddFunction() {
    this.setState({
      currentView: Views.ADD,
    });
  }

  _handleSelectFunction({ id, source }) {
    this.setState({
      currentView: Views.FUNCTION,
      selectedFunctionId: id,
      selectedFunctionSource: source,
    });
  }
  
  _handleApply({ argValues }) {
    const { selectedFunctionId, selectedFunctionSource } = this.state;
    
    this.props.onSelect({
      source: selectedFunctionSource,
      name: selectedFunctionId,
      argValues,
    });
  }
  
  _handleCreate({ title, description, args, returnType, code }) {
    const { projectFunctions } = this.props;
    
    const existingNames = Array.from(projectFunctions.keys());
    const name = functionNameFromTitle(title, existingNames);
    
    this.props.onCreateFunction({
      name,
      title,
      description,
      args,
      returnType,
      code,
    });
    
    this.setState({ currentView: Views.LIST });
  }

  _renderFunctionsList() {
    const {
      valueDef,
      userTypedefs,
      builtinFunctions,
      projectFunctions,
      getLocalizedText,
    } = this.props;

    const projectFunctionsList = [];
    const builtinFunctionsList = [];

    projectFunctions.forEach((fnDef, fnName) => {
      if (isCompatibleType(valueDef, fnDef.returnType, userTypedefs, null)) {
        projectFunctionsList.push({
          id: fnName,
          name: fnDef.title,
          description: fnDef.description,
        });
      }
    });
  
    builtinFunctions.forEach((fnDef, fnName) => {
      if (isCompatibleType(valueDef, fnDef.returnType, userTypedefs, null)) {
        builtinFunctionsList.push({
          id: fnName,
          name: fnDef.title,
          description: fnDef.description,
        });
      }
    });

    return (
      <FunctionsList
        projectFunctions={projectFunctionsList}
        builtinFunctions={builtinFunctionsList}
        getLocalizedText={getLocalizedText}
        onSelect={this._handleSelectFunction}
        onAdd={this._handleAddFunction}
        onReturn={this._handleReturn}
      />
    );
  }

  _renderFunctionWindow() {
    const {
      valueDef,
      projectFunctions,
      builtinFunctions,
      onNestedLink,
    } = this.props;
    
    const { selectedFunctionId, selectedFunctionSource } = this.state;

    const functionDefs = selectedFunctionSource === FunctionSources.BUILTIN
      ? builtinFunctions
      : projectFunctions;

    const functionDef = functionDefs.get(selectedFunctionId);

    return (
      <FunctionWindow
        targetValueDef={valueDef}
        functionDef={functionDef}
        onApply={this._handleApply}
        onReturn={this._handleReturn}
        onReturnToList={this._handleReturnToList}
        onNestedLink={onNestedLink}
      />
    );
  }
  
  _renderNewFunctionWindow() {
    const { projectFunctions, getLocalizedText } = this.props;
    
    const existingFunctionNames = Array.from(projectFunctions.keys());
    
    return (
      <NewFunctionWindow
        existingFunctionNames={existingFunctionNames}
        getLocalizedText={getLocalizedText}
        onCreate={this._handleCreate}
        onCancel={this._handleReturnToList}
      />
    );
  }
  
  render() {
    const { currentView } = this.state;

    switch (currentView) {
      case Views.LIST: return this._renderFunctionsList();
      case Views.FUNCTION: return this._renderFunctionWindow();
      case Views.ADD: return this._renderNewFunctionWindow();
      default: return null;
    }
  }
}

FunctionSelection.propTypes = propTypes;
FunctionSelection.defaultProps = defaultProps;
FunctionSelection.displayName = 'FunctionSelection';
