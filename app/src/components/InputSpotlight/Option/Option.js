/**
 * @author Ekaterina Marova
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OptionStyled } from './styles/OptionStyled';
import { noop } from '../../../utils/misc';

const propTypes = {
  id: PropTypes.any.isRequired,
  active: PropTypes.bool,
  onHover: PropTypes.func,
  onSelect: PropTypes.func,
};

const defaultProps = {
  active: false,
  onHover: noop,
  onSelect: noop,
};

export class Option extends Component {
  constructor(props, context) {
    super(props, context);

    this._handleClick = this._handleClick.bind(this);
    this._handleMouseEnter = this._handleMouseEnter.bind(this);
  }

  _handleClick(event) {
    const { id, onSelect } = this.props;

    if (event.button === 0) {
      onSelect({ id });
    }
  }

  _handleMouseEnter() {
    const { id, onHover } = this.props;
    onHover({ id });
  }

  render() {
    const { active, children } = this.props;

    return (
      <OptionStyled
        active={active}
        tabIndex={0}
        onClick={this._handleClick}
        onMouseEnter={this._handleMouseEnter}
      >
        {children}
      </OptionStyled>
    );
  }
}

Option.propTypes = propTypes;
Option.defaultProps = defaultProps;
Option.displayName = 'Option';
