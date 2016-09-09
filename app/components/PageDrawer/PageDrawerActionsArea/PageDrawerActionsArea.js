import React, { PropTypes, Component } from 'react';

export class PageDrawerActionsArea extends Component {
    render() {
        let className = 'page-drawer-actions-area';
        if (this.props.overlay) className += ' is-overlayed';

        return (
            <div className={className}>
	                {this.props.children}
            </div>
        );
    }
}

PageDrawerActionsArea.propTypes = {
	actionsType: PropTypes.oneOf(['text', 'icon']),
	actions: PropTypes.string
};

PageDrawerActionsArea.defaultProps = {
	actionsType: 'icon',
	actions: ''
};

PageDrawerActionsArea.displayName = 'PageDrawerActionsArea';

export * from './PageDrawerActionsGroup/PageDrawerActionsGroup'
export * from './PageDrawerActionItem/PageDrawerActionItem'
export * from './PageDrawerActionPlaceholder/PageDrawerActionPlaceholder'