'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { PropsList } from '../PropsList/PropsList';
import { PropEmpty } from '../props';

import {
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '../BlockContent/BlockContent';

import {
  FunctionArgumentNew,
} from './FunctionArgumentNew/FunctionArgumentNew';

import {
  FunctionAddArgumentButton,
} from './FunctionAddArgumentButton/FunctionAddArgumentButton';

import { returnArg, noop } from '../../utils/misc';
import './FunctionArgumentsList.scss';

export const FunctionArgumentPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

const propTypes = {
  items: PropTypes.arrayOf(FunctionArgumentPropType),
  getLocalizedText: PropTypes.func,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  items: [],
  getLocalizedText: returnArg,
  onAdd: noop,
  onDelete: noop,
};

export class FunctionArgumentsList extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      creatingNewArgument: false,
    };

    this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
    this._handleAddArgument = this._handleAddArgument.bind(this);
    this._handleCancelAddArgument = this._handleCancelAddArgument.bind(this);
    this._handleDeleteArgument = this._handleDeleteArgument.bind(this);
  }

  _handleAddButtonPress() {
    this.setState({ creatingNewArgument: true });
  }

  _handleAddArgument({ name, type }) {
    this.setState({ creatingNewArgument: false });
    this.props.onAdd({ name, type });
  }
  
  _handleCancelAddArgument() {
    this.setState({ creatingNewArgument: false });
  }

  _handleDeleteArgument({ id }) {
    const idx = parseInt(id, 10);
    this.props.onDelete({ idx });
  }

  render() {
    const { items, getLocalizedText } = this.props;

    const list = items.map(({ name, type }, idx) => (
      <PropEmpty
        key={name}
        id={String(idx)}
        label={name}
        secondaryLabel={getLocalizedText(`types.${type}`)}
        deletable
        onDelete={this._handleDeleteArgument}
      />
    ));

    const argumentsAdd = this.state.creatingNewArgument
      ? (
        <FunctionArgumentNew
          existingArgNames={items.map(item => item.name)}
          getLocalizedText={getLocalizedText}
          onAdd={this._handleAddArgument}
          onCancel={this._handleCancelAddArgument}
        />
      )
      : (
        <FunctionAddArgumentButton
          getLocalizedText={getLocalizedText}
          onPress={this._handleAddButtonPress}
        />
      );

    return (
      <div className="function-arguments_list">
        <BlockContentBoxHeading>
          {getLocalizedText('functions.new.argsList')}
        </BlockContentBoxHeading>

        <BlockContentBoxItem>
          <div className="function-arguments_list-items">
            <PropsList>
              {list}
            </PropsList>
          </div>
        </BlockContentBoxItem>

        <div className="function-arguments_new">
          {argumentsAdd}
        </div>
      </div>
    );
  }
}

FunctionArgumentsList.propTypes = propTypes;
FunctionArgumentsList.defaultProps = defaultProps;
FunctionArgumentsList.displayName = 'FunctionArgumentsList';
