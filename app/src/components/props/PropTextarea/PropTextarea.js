/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Textarea } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  transformValue: PropTypes.func,
  onChange: PropTypes.func,
};

const defaultProps = {
  value: '',
  disabled: false,
  transformValue: returnArg,
  onChange: noop,
};

export class PropTextarea extends PropBase {
  constructor(props, context) {
    super(props, context);
    this._handleChange = this._handleChange.bind(this);
  }
  
  /**
   *
   * @param {string} value
   * @private
   */
  _handleChange({ value }) {
    this.props.onChange({
      id: this.props.id,
      value: this.props.transformValue(value),
    });
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    if (this.props.checkable && !this.props.checked) return null;
    
    //noinspection JSValidateTypes
    return (
      <Textarea
        stateless
        value={this.props.value}
        disabled={this.props.disabled}
        onChange={this._handleChange}
      />
    );
  }
}

PropTextarea.propTypes = { ...PropBase.propTypes, ...propTypes };
PropTextarea.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropTextarea.displayName = 'PropTextarea';
