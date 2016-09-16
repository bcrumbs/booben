'use strict';

import React, { PropTypes } from 'react';

export const PageDrawerActionsArea = props => {
    let className = 'page-drawer-actions-area';
    if (props.overlay) className += ' is-overlayed';

    return (
        <div className={className}>
            {props.children}
        </div>
    );
};

PageDrawerActionsArea.propTypes = {
    actionsType: PropTypes.oneOf(['text', 'icon']),
    actions: PropTypes.string
};

PageDrawerActionsArea.defaultProps = {
    actionsType: 'icon',
    actions: ''
};

PageDrawerActionsArea.displayName = 'PageDrawerActionsArea';

export * from './PageDrawerActionsGroup/PageDrawerActionsGroup';
export * from './PageDrawerActionItem/PageDrawerActionItem';
export * from './PageDrawerActionPlaceholder/PageDrawerActionPlaceholder';
