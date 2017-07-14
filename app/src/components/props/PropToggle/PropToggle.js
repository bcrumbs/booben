/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { ToggleButton } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop } from '../../../utils/misc';

const propTypes = {
  ...PropBase.propTypes,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

const defaultProps = {
  ...PropBase.defaultProps,
  value: false,
  disabled: false,
  onChange: noop,
};

export class PropToggle extends PropBase {
  constructor(props, context) {
    super(props, context);
    this._handleChange = this._handleChange.bind(this);
  }
  
  /**
   *
   * @param {boolean} value
   * @private
   */
  _handleChange({ value }) {
    const { onChange } = this.props;
    onChange({ value });
  }
  
  /**
   *
   * @return {ReactElement[]}
   * @override
   * @private
   */
  _renderAdditionalActions() {
    const { linked, checkable, checked, value, disabled } = this.props;
    
    if (linked || (checkable && !checked)) return [];
    
    return [
      <div key="toggle">
        <ToggleButton
          checked={value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      </div>,
    ];
  }
  
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    return null;
  }
}

PropToggle.propTypes = propTypes;
PropToggle.defaultProps = defaultProps;
PropToggle.displayName = 'PropToggle';
