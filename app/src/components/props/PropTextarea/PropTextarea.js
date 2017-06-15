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
    const { id, transformValue, onChange } = this.props;
    onChange({ id, value: transformValue(value) });
  }
  
  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    const { checkable, checked, placeholder, value, disabled } = this.props;
    
    if (checkable && !checked) return null;
    
    return (
      <Textarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={this._handleChange}
      />
    );
  }
}

PropTextarea.propTypes = propTypes;
PropTextarea.defaultProps = defaultProps;
PropTextarea.displayName = 'PropTextarea';
