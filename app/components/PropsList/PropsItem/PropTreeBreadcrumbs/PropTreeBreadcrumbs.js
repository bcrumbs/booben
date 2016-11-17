'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import { Breadcrumbs } from '@reactackle/reactackle';

export const PropTreeBreadcrumbs = props => (
    <div className='prop-tree-breadcrumbs'>
        <Breadcrumbs items={props.items} mode="dark"/>
    </div>
);

PropTreeBreadcrumbs.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        subtitle: PropTypes.string
    }))
};

PropTreeBreadcrumbs.defaultProps = {
    items: []
};

PropTreeBreadcrumbs.displayName = 'PropTreeBreadcrumbs';
