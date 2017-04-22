'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import './PageDrawer.scss';

const propTypes = {
  isExpanded: PropTypes.bool,
  overlay: PropTypes.bool,
  hasActions: PropTypes.bool,
};

const defaultProps = {
  isExpanded: true,
  overlay: false,
  hasActions: false,
};

export const PageDrawer = props => {
  let className = 'page-drawer';
  className += props.isExpanded ? ' is-expanded' : ' is-collapsed';
  if (props.overlay) className += ' is-overlayed';
  if (props.hasActions) className += ' page-drawer-has-actions';

  return (
    <div className={className}>
      <div className="page-drawer-wrapper">
        {props.children}
      </div>
    </div>
  );
};

PageDrawer.propTypes = propTypes;
PageDrawer.defaultProps = defaultProps;
PageDrawer.displayName = 'PageDrawer';

export * from './PageDrawerActionsArea/PageDrawerActionsArea';
export * from './PageDrawerContentArea/PageDrawerContentArea';
