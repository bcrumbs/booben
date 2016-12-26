/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import { PropTypes } from 'react';
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

export class PropExpandable extends PropBase {
  constructor(...args) {
    super(...args);
    
    this._handleExpandAction = this._handleExpandAction.bind(this);
    
    this._additionalActions = [{
      id: 'collapse',
      icon: 'chevron-right',
      handler: this._handleExpandAction,
    }];
  }
  
  /**
   *
   * @private
   */
  _handleExpandAction() {
    this.props.onToggle({ expanded: !this.props.expanded });
  }
  
  /**
   *
   * @return {PropActionObject[]}
   * @override
   * @private
   */
  _getAdditionalActions() {
    return this._additionalActions;
  }
  
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
  
  /**
   *
   * @return {string[]}
   * @override
   * @private
   */
  _getAdditionalWrapperClassNames() {
    return this.props.expanded ? ['sublevel-is-visible'] : [];
  }
  
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
