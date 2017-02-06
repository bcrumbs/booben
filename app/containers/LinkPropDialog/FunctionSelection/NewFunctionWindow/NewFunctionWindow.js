/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { TypeNames } from '@jssy/types';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
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

import { returnArg } from '../../../../utils/misc';

const propTypes = {
  getLocalizedText: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
};

const without = (array, idx) => {
  const ret = [];
  
  for (let i = 0; i < array.length; i++)
    if (i !== idx) ret.push(array[i]);
  
  return ret;
};

export class NewFunctionWindow extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      title: '',
      description: '',
      returnType: TypeNames.STRING,
      args: [],
    };
    
    this._handleTitleChange = this._handleTitleChange.bind(this);
    this._handleDescriptionChange = this._handleDescriptionChange.bind(this);
    this._handleReturnTypeChange = this._handleReturnTypeChange.bind(this);
    this._handleAddArg = this._handleAddArg.bind(this);
    this._handleDeleteArg = this._handleDeleteArg.bind(this);
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
  
  render() {
    const { getLocalizedText } = this.props;
    const { title, description, returnType, args } = this.state;
    
    const typeSelectOptions = this._getTypeSelectOptions();
    
    return (
      <BlockContent>
        <BlockContentBox>
          <BlockContentBoxItem>
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
  
          <BlockContentBoxItem>
            <FunctionArgumentsList
              items={args}
              getLocalizedText={getLocalizedText}
              onAdd={this._handleAddArg}
              onDelete={this._handleDeleteArg}
            />
          </BlockContentBoxItem>
        </BlockContentBox>
      </BlockContent>
    );
  }
}

NewFunctionWindow.propTypes = propTypes;
NewFunctionWindow.defaultProps = defaultProps;
NewFunctionWindow.displayName = 'NewFunctionWindow';
