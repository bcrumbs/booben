'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { TypeNames } from '@jssy/types';

import {
  Input,
  SelectBox,
  Button,
} from '@reactackle/reactackle';

import {
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '../../BlockContent/BlockContent';

import { returnArg, noop } from '../../../utils/misc';

const propTypes = {
  existingArgNames: PropTypes.arrayOf(PropTypes.string),
  getLocalizedText: PropTypes.func,
  onAdd: PropTypes.func,
  onCancel: PropTypes.func,
};

const defaultProps = {
  existingArgNames: [],
  getLocalizedText: returnArg,
  onAdd: noop,
  onCancel: noop,
};

const ARG_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export class FunctionArgumentNew extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      name: '',
      type: TypeNames.STRING,
    };
    
    this._handleNameChange = this._handleNameChange.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
    this._handleCancelButtonPress = this._handleCancelButtonPress.bind(this);
  }
  
  _getTypeOptions() {
    const { getLocalizedText } = this.props;
    
    return [
      { value: TypeNames.STRING, text: getLocalizedText('types.string') },
      { value: TypeNames.INT, text: getLocalizedText('types.int') },
      { value: TypeNames.FLOAT, text: getLocalizedText('types.float') },
      { value: TypeNames.BOOL, text: getLocalizedText('types.bool') },
    ];
  }
  
  _handleNameChange(newName) {
    this.setState({ name: newName });
  }
  
  _handleTypeChange(newType) {
    this.setState({ type: newType });
  }
  
  _handleAddButtonPress() {
    const { name, type } = this.state;
    this.props.onAdd({ name, type });
  }
  
  _handleCancelButtonPress() {
    this.props.onCancel();
  }
  
  render() {
    const { existingArgNames, getLocalizedText } = this.props;
    const { name, type } = this.state;
    
    const typeOptions = this._getTypeOptions();
    const isButtonDisabled =
      !name || !type || existingArgNames.indexOf(name) !== -1;
    
    return (
      <div className="function-arguments_new-wrapper" >
        <BlockContentBoxItem>
          <BlockContentBoxHeading>
            {getLocalizedText('functions.new.newArg.heading')}
          </BlockContentBoxHeading>
      
          <div className="inputs-row" >
            <Input
              label={getLocalizedText('functions.new.newArg.title')}
              value={name}
              pattern={ARG_NAME_PATTERN}
              stateless
              onChange={this._handleNameChange}
            />
            
            <SelectBox
              label={getLocalizedText('functions.new.newArg.type')}
              value={type}
              data={typeOptions}
              stateless
              onSelect={this._handleTypeChange}
            />
          </div>
      
          <div className="button-row" >
            <Button
              text={getLocalizedText('functions.new.newArg.add')}
              narrow
              disabled={isButtonDisabled}
              onPress={this._handleAddButtonPress}
            />
  
            <Button
              text={getLocalizedText('cancel')}
              narrow
              onPress={this._handleCancelButtonPress}
            />
          </div>
        </BlockContentBoxItem>
      </div>
    );
  }
}

FunctionArgumentNew.propTypes = propTypes;
FunctionArgumentNew.defaultProps = defaultProps;
FunctionArgumentNew.displayName = 'FunctionArgumentNew';
