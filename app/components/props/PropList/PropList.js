/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
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

export class PropList extends PropBase {
  constructor(props) {
    super(props);
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
  
  //noinspection JSUnusedGlobalSymbols
  /**
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    const {
      checkable,
      checked,
      options,
      value,
      placeholder,
      disabled,
    } = this.props;
    
    if (checkable && !checked) return null;
    
    //noinspection JSValidateTypes
    return (
      <SelectBox
        stateless
        data={options}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={this._handleChange}
      />
    );
  }
}

PropList.propTypes = propTypes;
PropList.defaultProps = defaultProps;
PropList.displayName = 'PropList';
