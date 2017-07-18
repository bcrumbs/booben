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

export class PropTextarea extends Component {
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

  render() {
    const { checkable, checked, placeholder, value, disabled } = this.props;

    const propsForBase = _pick(this.props, baseProps);

    let content = null;
    if (!checkable || checked) {
      content = (
        <TextField
          multiline
          multilineRows={{ min: 1 }}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    }

    return (
      <PropBase
        {...propsForBase}
        content={content}
      />
    );
  }
}

PropTextarea.propTypes = propTypes;
PropTextarea.defaultProps = defaultProps;
PropTextarea.displayName = 'PropTextarea';
