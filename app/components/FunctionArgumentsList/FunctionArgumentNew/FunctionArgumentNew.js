'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';

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
  getLocalizedText: PropTypes.func,
  onAdd: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onAdd: noop,
};

const typeOptions = [
  { value: 'string', text: 'string', disabled: false },
  { value: 'bool', text: 'bool', disabled: false },
  { value: 'int', text: 'int', disabled: false },
  { value: 'float', text: 'float', disabled: false },
];

export class FunctionArgumentNew extends PureComponent {
  constructor(props) {
    super(props);
    
    this._name = '';
    this._type = 'string';
    
    this._handleNameChange = this._handleNameChange.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
  }
  
  _handleNameChange(newName) {
    this._name = newName;
  }
  
  _handleTypeChange(newType) {
    this._type = newType;
  }
  
  _handleAddButtonPress() {
    this.props.onAdd({
      name: this._name,
      type: this._type,
    });
  }
  
  render() {
    const { getLocalizedText } = this.props;
    
    return (
      <div className="function-arguments_new-wrapper" >
        <BlockContentBoxItem>
          <BlockContentBoxHeading>
            {getLocalizedText('replace_me:New Argument')}
          </BlockContentBoxHeading>
      
          <div className="inputs-row" >
            <Input
              label={getLocalizedText('replace_me:Title')}
              onChange={this._handleNameChange}
            />
            
            <SelectBox
              label={getLocalizedText('replace_me:Type')}
              data={typeOptions}
              onSelect={this._handleTypeChange}
            />
          </div>
      
          <div className="button-row" >
            <Button
              text={getLocalizedText('replace_me:Add argument')}
              narrow
              onPress={this._handleAddButtonPress}
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
