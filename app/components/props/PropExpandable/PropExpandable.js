/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
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
    this.props.onToggle({ expanded: !this.props.expanded });
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {ReactElement[]}
   * @override
   * @private
   */
  _renderAdditionalActions() {
    if (this.props.checkable && !this.props.checked) return [];
    
    //noinspection JSValidateTypes
    return [
      <PropAction
        key="collapse"
        id="collapse"
        icon="chevron-right"
        onPress={this._handleExpandAction}
      />,
    ];
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {string[]}
   * @override
   * @private
   */
  _getAdditionalClassNames() {
    return this.props.expanded
      ? ['has-sublevels', 'sublevel-is-visible']
      : ['has-sublevels'];
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {string[]}
   * @override
   * @private
   */
  _getAdditionalWrapperClassNames() {
    return this.props.expanded ? ['sublevel-is-visible'] : [];
  }
  
  //noinspection JSUnusedGlobalSymbols
  /**
   *
   * @return {null}
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
