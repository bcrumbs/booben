'use strict';

// noinspection JSUnresolvedVariable
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

import './FunctionArgumentsList.scss';

import { returnArg, noop } from '../../utils/misc';

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
  newArgument: false,
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
    this._handleDeleteArgument = this._handleDeleteArgument.bind(this);
  }

  _handleAddButtonPress() {
    this.setState({
      creatingNewArgument: true,
    });
  }

  _handleAddArgument(name, type) {
    this.setState({
      creatingNewArgument: false,
    });

    // TODO: Call onAdd
  }

  _handleDeleteArgument(idx) {
    // TODO: Call onDelete
  }

  render() {
    const { items, getLocalizedText } = this.props;

    const list = items.map(({ name, type }) => (
      <PropEmpty
        key={name}
        label={name}
        secondaryLabel={type}
        deletable
      />
    ));

    const argumentsAdd = this.state.creatingNewArgument
      ? <FunctionArgumentNew />
      : <FunctionAddArgumentButton onPress={this._handleAddButtonPress} />;

    return (
      <div className="function-arguments_list" >
        <BlockContentBoxHeading>
          {getLocalizedText('replace_me:Arguments List')}
        </BlockContentBoxHeading>

        <BlockContentBoxItem>
          <div className="function-arguments_list-items" >
            <PropsList>
              {list}
            </PropsList>
          </div>
        </BlockContentBoxItem>

        <div className="function-arguments_new" >
          {argumentsAdd}
        </div>
      </div>
    );
  }
}

FunctionArgumentsList.propTypes = propTypes;
FunctionArgumentsList.defaultProps = defaultProps;
FunctionArgumentsList.displayName = 'FunctionArgumentsList';
