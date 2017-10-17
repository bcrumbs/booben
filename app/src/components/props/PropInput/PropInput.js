/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash.pick';
import { TextField } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  ...PropBase.propTypes,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  transformValue: PropTypes.func,
  onChange: PropTypes.func,
};

const defaultProps = {
  ...PropBase.defaultProps,
  value: '',
  placeholder: '',
  disabled: false,
  transformValue: returnArg,
  onChange: noop,
};

const baseProps = Object.keys(PropBase.propTypes);

export class PropInput extends Component {
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
    const { id, transformValue, onChange } = this.props;
    onChange({ id, value: transformValue(value) });
  }
  
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  render() {
    const { checkable, checked, value, placeholder, disabled } = this.props;

    const propsForBase = _pick(this.props, baseProps);

    let content = null;
    if (!checkable || checked) {
      content = (
        <TextField
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={this._handleChange}
          dense
        />
      );
    }

    return (
      <PropBase
        {...propsForBase}
        content={content}
        labelPositionTop
      />
    );
  }
}

PropInput.propTypes = propTypes;
PropInput.defaultProps = defaultProps;
PropInput.displayName = 'PropInput';
