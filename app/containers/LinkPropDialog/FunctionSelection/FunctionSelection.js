/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FunctionsList } from './FunctionsList/FunctionsList';
import { FunctionWindow } from './FunctionWindow/FunctionWindow';
import { NewFunctionWindow } from './NewFunctionWindow/NewFunctionWindow';
import { FunctionSources } from '../../../utils/functions';
import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  projectFunctions: ImmutablePropTypes.map,
  builtinFunctions: ImmutablePropTypes.map,
  getLocalizedText: PropTypes.func,
  onReturn: PropTypes.func,
  onReplaceButtons: PropTypes.func,
};

const defaultProps = {
  projectFunctions: {},
  builtinFunctions: {},
  getLocalizedText: returnArg,
  onReturn: noop,
  onReplaceButtons: noop,
};

const Views = {
  LIST: 0,
  FUNCTION: 1,
  ADD: 2,
  CODE: 3,
};

export class FunctionSelection extends PureComponent {
  constructor(props) {
    super(props);

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

  _renderFunctionsList() {
    const { builtinFunctions, projectFunctions } = this.props;

    const projectFunctionsList = [];
    const builtinFunctionsList = [];

    projectFunctions.forEach((fnDef, fnName) => {
      projectFunctionsList.push({
        id: fnName,
        name: fnDef.title,
        description: fnDef.description,
      });
    });
  
    builtinFunctions.forEach((fnDef, fnName) => {
      builtinFunctionsList.push({
        id: fnName,
        name: fnDef.title,
        description: fnDef.description,
      });
    });

    return (
      <FunctionsList
        projectFunctions={projectFunctionsList}
        builtinFunctions={builtinFunctionsList}
        onSelect={this._handleSelectFunction}
        onAdd={this._handleAddFunction}
        onReturn={this._handleReturn}
      />
    );
  }

  _renderFunctionWindow() {
    const { projectFunctions, builtinFunctions, getLocalizedText } = this.props;
    const { selectedFunctionId, selectedFunctionSource } = this.state;

    const functionDefs = selectedFunctionSource === FunctionSources.BUILTIN
      ? builtinFunctions
      : projectFunctions;

    const functionDef = functionDefs.get(selectedFunctionId);

    return (
      <FunctionWindow
        functionDef={functionDef}
        getLocalizedText={getLocalizedText}
        onReturn={this._handleReturn}
        onReturnToList={this._handleReturnToList}
      />
    );
  }
  
  _renderNewFunctionWindow() {
    const { getLocalizedText } = this.props;
    
    return (
      <NewFunctionWindow
        getLocalizedText={getLocalizedText}
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
