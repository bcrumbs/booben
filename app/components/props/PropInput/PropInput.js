/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Input } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop } from '../../../utils/misc';

const propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

const defaultProps = {
  value: '',
  disabled: false,
  onChange: noop,
};

export class PropInput extends PropBase {
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    if (this.props.checkable && !this.props.checked) return null;
    
    //noinspection JSValidateTypes
    return (
      <Input
        stateless
        value={this.props.value}
        disabled={this.props.disabled}
        onChange={this.props.onChange}
      />
    );
  }
}

PropInput.propTypes = { ...PropBase.propTypes, ...propTypes };
PropInput.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropInput.displayName = 'PropInput';
