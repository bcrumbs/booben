/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _pick from 'lodash.pick';
import { PropBase } from '../PropBase/PropBase';
import { noop } from '../../../utils/misc';

const propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
};

const defaultProps = {
  expanded: false,
  onToggle: noop,
};

const baseProps = Object.keys(PropBase.propTypes);

export class PropExpandable extends Component {
  constructor(...args) {
    super(...args);

    this._handleExpandAction = this._handleExpandAction.bind(this);
  }

  /**
   *
   * @private
   */
  _handleExpandAction() {
    const { expanded, onToggle } = this.props;
    onToggle({ expanded: !expanded });
  }

  render() {
    const {
      checkable,
      checked,
      linked,
      expanded,
      additionalActions,
      children,
    } = this.props;

    const propsForBase = _pick(this.props, baseProps);
    let actualAdditionalActions = additionalActions;

    if (!linked && (!checkable || checked)) {
      actualAdditionalActions = [...actualAdditionalActions, {
        id: 'expand',
        icon: 'chevron-right',
        rounded: true,
        expanded,
        handler: this._handleExpandAction,
      }];
    }

    const actualChildren = expanded ? children : null;

    return (
      <PropBase
        {...propsForBase}
        additionalActions={actualAdditionalActions}
        content={null}
      >
        {actualChildren}
      </PropBase>
    );
  }
}

PropExpandable.propTypes = { ...PropBase.propTypes, ...propTypes };
PropExpandable.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropExpandable.displayName = 'PropExpandable';
