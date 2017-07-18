/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { PropBase } from '../PropBase/PropBase';
import { PropAction } from '../PropBase/PropAction/PropAction';
import { noop } from '../../../utils/misc';

const propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
};

const defaultProps = {
  expanded: false,
  onToggle: noop,
};

export class PropExpandable extends PropBase {
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

  /**
   *
   * @return {ReactElement[]}
   * @override
   * @private
   */
  _renderAdditionalActions() {
    const { checkable, checked, expanded } = this.props;

    if (checkable && !checked) return [];

    return [
      <PropAction
        key="collapse"
        id="collapse"
        icon="chevron-right"
        onPress={this._handleExpandAction}
        rounded
        expanded={expanded}
      />,
    ];
  }

  /**
   *
   * @return {?ReactElement}
   * @override
   * @private
   */
  _renderContent() {
    return null;
  }
}

PropExpandable.propTypes = { ...PropBase.propTypes, ...propTypes };
PropExpandable.defaultProps = { ...PropBase.defaultProps, ...defaultProps };
PropExpandable.displayName = 'PropExpandable';
