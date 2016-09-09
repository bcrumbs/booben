import React, { PropTypes, Component } from 'react';

export const PageDrawerActionPlaceholder = props => {
    let className = 'page-drawer-action-placeholder';

    return (
        <div className={className}>
	        <div className='action-placeholder-box'></div>
        </div>
    );
}

PageDrawerActionPlaceholder.displayName = 'PageDrawerActionPlaceholder';
