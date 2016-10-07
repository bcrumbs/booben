import React, { PropTypes } from 'react';

export const PropTree = props => (

    <div className='prop-item-tree-wrapper'>
        {props.children}
    </div>

);

PropTree.displayName = 'PropTree';

export * from './PropTreeList/PropTreeList';
export * from './PropTreeItem/PropTreeItem';

