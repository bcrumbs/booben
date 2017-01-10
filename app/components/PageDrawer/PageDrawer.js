'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
  PageDrawerActionsArea,
} from './PageDrawerActionsArea/PageDrawerActionsArea';

import './PageDrawer.scss';

// TODO: Figure out WTF is going on here

const propTypes = {
  defaultExpanded: PropTypes.bool,
  isExpanded: PropTypes.bool,
  isEmpty: PropTypes.bool,
  title: PropTypes.string,
  collapseButtonText: PropTypes.string,
  mode: PropTypes.oneOf(['overlay', 'shift', 'resize']),
};

const defaultProps = {
  defaultExpanded: true,
  isExpanded: true,
  isEmpty: true,
  title: '',
  collapseButtonText: 'collapse',
  mode: 'resize',
};

export const PageDrawer = props => {
  let className = 'page-drawer',
    children = props.children;

  className += props.isExpanded ? ' is-expanded' : ' is-collapsed';

  if (props.overlay) className += ' is-overlayed';
  if (props.isEmpty) className += ' is-empty';

  if (children) {
    children = React.Children.toArray(children);

    let actionsArea = null;

    for (let i = 0, l = children.length; i < l; i++) {
      if (children[i].type === PageDrawerActionsArea) {
        actionsArea = children[i];
        break;
      }
    }

    if (actionsArea !== null)
      className += ' page-drawer-has-actions';
  }

  let collapseButton = null;
  if (props.collapseButtonText) {
    collapseButton = (
      <a className="page-drawer-collapse-button" >
        {props.collapseButtonText}
      </a>
    );
  }

  const actions = props.actions
    ? props.data.map(item => getActions(item))
    : null;

  let actionsArea = null;
  if (props.actionsType || collapseButton) {
    actionsArea = (
      <PageDrawerActionsArea >
        {collapseButton}
        {actions}
      </PageDrawerActionsArea>
    );
  }

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
