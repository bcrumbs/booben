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
  onToggle: PropTypes.func,
};

const defaultProps = {
  value: false,
  disabled: false,
  onToggle: noop,
};

export class PropToggle extends PropBase {
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
          onCheck={this.props.onToggle}
        />
      </div>,
    ];
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {null}
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
