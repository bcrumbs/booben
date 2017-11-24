/**
 * @author Dmitriy Bizyaev
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash.pick';
import { SelectBox } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop } from '../../../utils/misc';

const propTypes = {
  ...PropBase.propTypes,
  value: PropTypes.any,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any,
    text: PropTypes.string,
    disabled: PropTypes.bool,
  })),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

const defaultProps = {
  ...PropBase.defaultProps,
  value: null,
  options: [],
  placeholder: '',
  disabled: false,
  onChange: noop,
};

const baseProps = Object.keys(PropBase.propTypes);

export class PropList extends Component {
  constructor(props, context) {
    super(props, context);
    this._handleChange = this._handleChange.bind(this);
  }
  
  /**
   *
   * @param {*} value
   * @private
   */
  _handleChange({ value }) {
    const { id, onChange } = this.props;
    onChange({ id, value });
  }

  render() {
    const {
      checkable,
      checked,
      options,
      value,
      placeholder,
      disabled,
    } = this.props;

    const propsForBase = _pick(this.props, baseProps);

    let content = null;
    if (!checkable || checked) {
      content = (
        <SelectBox
          options={options}
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
      />
    );
  }
}

PropList.propTypes = propTypes;
PropList.defaultProps = defaultProps;
PropList.displayName = 'PropList';
