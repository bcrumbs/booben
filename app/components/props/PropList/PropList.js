/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { SelectBox } from '@reactackle/reactackle';
import { PropBase } from '../PropBase/PropBase';
import { noop } from '../../../utils/misc';

const propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any,
    text: PropTypes.string,
    disabled: PropTypes.bool,
  })),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

const defaultProps = {
  value: null,
  options: [],
  disabled: false,
  onChange: noop,
};

export class PropList extends PropBase {
  constructor(props) {
    super(props);
    this._handleChange = this._handleChange.bind(this);
  }
  
  _handleChange(newValue) {
    this.props.onChange({ value: newValue });
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   * @return {ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    if (this.props.checkable && !this.props.checked) return null;
    
    //noinspection JSValidateTypes
    return (
      <SelectBox
        stateless
        data={this.props.options}
        value={this.props.value}
        disabled={this.props.disabled}
        onSelect={this._handleChange}
      />
    );
  }
}

PropList.propTypes = { ...PropBase.propTypes, ...propTypes };
PropList.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropList.displayName = 'PropList';
