'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';

import { Breadcrumbs } from '@reactackle/reactackle';

import { noop } from '../../../../utils/misc';

const LinkComponent = props => (
    <span className={props.className} onClick={props.onClick}>
        {props.children}
    </span>
);

export const PropTreeBreadcrumbs = props => (
    <div className='prop-tree-breadcrumbs'>
        <Breadcrumbs
            items={props.items}
            linkComponent={LinkComponent}
            mode="dark"
            onItemClick={props.onItemSelect}
        />
    </div>
);

PropTreeBreadcrumbs.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        subtitle: PropTypes.string,
        home: PropTypes.bool
    })),

    onItemSelect: PropTypes.func
};

PropTreeBreadcrumbs.defaultProps = {
    items: [],

    onItemSelect: noop
};

PropTreeBreadcrumbs.displayName = 'PropTreeBreadcrumbs';
