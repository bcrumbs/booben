'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TooltipIcon } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';
import './SourceGroupItem.scss';

const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  type: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func,
};

const defaultProps = {
  title: '',
  type: '',
  description: '',
  disabled: false,
  onSelect: noop,
};

export class SourceGroupItem extends Component {
  constructor(props) {
    super(props);

    this._handleClick = this._handleClick.bind(this);
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleClick(event) {
    const { id, disabled, onSelect } = this.props;
    if (disabled || event.button !== 0) return;
    onSelect({ id });
  }

  render() {
    const { title, type, description, disabled } = this.props;

    let className = 'source-item';
    if (disabled) className += ' is-disabled';

    let tooltipElement = null;
    if (description) {
      tooltipElement = (
        <TooltipIcon text={description} />
      );
    }

    return (
      <li className={className} onClick={this._handleClick}>
        <span className="source-item_title">
          {title}
        </span>

        <span className="source-item_type">
          {type}
        </span>

        {tooltipElement}
      </li>
    );
  }
}

SourceGroupItem.displayName = 'SourceGroupItem';
SourceGroupItem.propTypes = propTypes;
SourceGroupItem.defaultProps = defaultProps;
