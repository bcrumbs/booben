/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
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
  constructor(props) {
    super(props);
    this._handleChange = this._handleChange.bind(this);
  }
  
  /**
   *
   * @param {boolean} newValue
   * @private
   */
  _handleChange(newValue) {
    this.props.onChange({ value: newValue });
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {ReactElement[]}
   * @override
   * @private
   */
  _renderAdditionalActions() {
    if (this.props.checkable && !this.props.checked) return [];
    
    //noinspection JSValidateTypes
    return [
      <div key="toggle" className="prop_action prop_action-toggle">
        <ToggleButton
          checked={this.props.value}
          disabled={this.props.disabled}
          onCheck={this._handleChange}
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
