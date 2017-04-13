'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  overlay: PropTypes.bool,
};

const defaultProps = {
  overlay: false,
};

export const PageDrawerActionsArea = props => {
  let className = 'page-drawer-actions-area';
  if (props.overlay) className += ' is-overlayed';

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

PageDrawerActionsArea.propTypes = propTypes;
PageDrawerActionsArea.defaultProps = defaultProps;
PageDrawerActionsArea.displayName = 'PageDrawerActionsArea';

export * from './PageDrawerActionsGroup/PageDrawerActionsGroup';
export * from './PageDrawerActionItem/PageDrawerActionItem';
export * from './PageDrawerActionPlaceholder/PageDrawerActionPlaceholder';
