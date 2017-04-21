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
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

const defaultProps = {
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
    this.props.onChange({ value });
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {ReactElement[]}
   * @override
   * @private
   */
  _renderAdditionalActions() {
    const willHideToggle =
      this.props.linked || (
        this.props.checkable &&
        !this.props.checked
      );
    
    if (willHideToggle) return [];
    
    //noinspection JSValidateTypes
    return [
      <div key="toggle" className="prop_action prop_action-toggle">
        <ToggleButton
          checked={this.props.value}
          disabled={this.props.disabled}
          onChange={this._handleChange}
        />
      </div>,
    ];
  }
  
  //noinspection JSUnusedGlobalSymbols
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

PropToggle.propTypes = { ...PropBase.propTypes, ...propTypes };
PropToggle.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropToggle.displayName = 'PropToggle';
