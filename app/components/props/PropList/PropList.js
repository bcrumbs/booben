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
  onSelect: PropTypes.func,
};

const defaultProps = {
  value: null,
  options: [],
  disabled: false,
  onSelect: noop,
};

export class PropList extends PropBase {
  /**
   *
   * @return {ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    //noinspection JSValidateTypes
    return (
      <SelectBox
        data={this.props.options}
        value={this.props.value}
        disabled={this.props.disabled}
        stateless
        onSelect={this.props.onSelect}
      />
    );
  }
}

PropList.propTypes = { ...PropBase.propTypes, ...propTypes };
PropList.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropList.displayName = 'PropList';
