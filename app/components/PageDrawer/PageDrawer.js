import './PageDrawer.scss'

import React, { PropTypes } from 'react';
import { PageDrawerActionsArea } from './PageDrawerActionsArea/PageDrawerActionsArea';

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
        collapseButton =
            <a className='page-drawer-collapse-button' >
                {props.collapseButtonText}
            </a>;
    }

    let actions = null;
    if (props.actions) {
        actions = props.data.map((item) => {
            return getActions(item);
        })
    }

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
            <div className='page-drawer-wrapper'>
                { props.children }
            </div>
        </div>
    );
};

PageDrawer.propTypes = {
    defaultExpanded: PropTypes.bool,
    isExpanded: PropTypes.bool,
    isEmpty: PropTypes.bool,
    title: PropTypes.string,
    collapseButtonText: PropTypes.string,
    mode: PropTypes.oneOf(['overlay', 'shift', 'resize'])
};

PageDrawer.defaultProps = {
    defaultExpanded: true,
    isExpanded: true,
    isEmpty: true,
    title: '',
    collapseButtonText: 'collapse',
    mode: 'resize'
};

PageDrawer.displayName = 'PageDrawer';

export * from './PageDrawerActionsArea/PageDrawerActionsArea';
export * from './PageDrawerContentArea/PageDrawerContentArea';
