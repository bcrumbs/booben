'use strict';

import './RoutesList.scss';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

export const RoutesList = props => (
    <ul className="routes-list-wrapper">
        {props.children}
    </ul>
);

RoutesList.displayName = 'RoutesList';

export * from './RouteCard/RouteCard';
export * from './RouteNewButton/RouteNewButton';
export * from './RouteNewChildButton/RouteNewChildButton';
