/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Textarea } from '@reactackle/reactackle';
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

export class PropTextarea extends PropBase {
  /**
   *
   * @return {ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    //noinspection JSValidateTypes
    return (
      <Textarea
        value={this.props.value}
        disabled={this.props.disabled}
        stateless
        onChange={this.props.onChange}
      />
    );
  }
}

PropTextarea.propTypes = { ...PropBase.propTypes, ...propTypes };
PropTextarea.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropTextarea.displayName = 'PropTextarea';
