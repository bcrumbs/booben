/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FunctionsList } from './FunctionsList/FunctionsList';
import { FunctionWindow } from './FunctionWindow/FunctionWindow';
import { Functions } from './common';
import { FunctionSources } from '../../../utils/functions';
import { objectToArray, noop } from '../../../utils/misc';

const propTypes = {
  projectFunctions: ImmutablePropTypes.map,
  builtinFunctions: Functions,
  onReturn: PropTypes.func,
};

const defaultProps = {
  projectFunctions: {},
  builtinFunctions: {},
  onReturn: noop,
};

const Views = {
  LIST: 0,
  ADD: 1,
  FUNCTION: 2,
};

export class FunctionSelection extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentView: Views.LIST,
      selectedFunctionId: '',
      selectedFunctionSource: '',
    };

    this._handleReturn = this._handleReturn.bind(this);
    this._handleAddFunction = this._handleAddFunction.bind(this);
    this._handleSelectFunction = this._handleSelectFunction.bind(this);
  }

  _handleReturn() {
    this.props.onReturn();
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

    projectFunctions.forEach((fnDef, fnName) => {
      projectFunctionsList.push({
        id: fnName,
        name: fnDef.title,
        description: fnDef.description,
      });
    });

    const builtinFunctionsList =
      objectToArray(builtinFunctions, (fnDef, fnName) => ({
        id: fnName,
        name: fnDef.title,
        description: fnDef.description,
      }));

    return (
      <FunctionsList
        projectFunctions={projectFunctionsList}
        builtinFunctions={builtinFunctionsList}
        onAdd={this._handleAddFunction}
        onReturn={this._handleReturn}
      />
    );
  }

  _renderFunctionWindow() {
    const { projectFunctions, builtinFunctions } = this.props;
    const { selectedFunctionId, selectedFunctionSource } = this.state;

    const functionDefs = selectedFunctionSource === FunctionSources.BUILTIN
      ? builtinFunctions
      : projectFunctions;

    const functionDef = functionDefs[selectedFunctionId];

    return (
      <FunctionWindow
        functionDef={functionDef}
      />
    );
  }
  
  render() {
    const { currentView } = this.state;

    switch (currentView) {
      case Views.LIST: return this._renderFunctionsList();
      case Views.FUNCTION: return this._renderFunctionWindow();
      default: return null;
    }
  }
}

FunctionSelection.propTypes = propTypes;
FunctionSelection.defaultProps = defaultProps;
FunctionSelection.displayName = 'FunctionSelection';
