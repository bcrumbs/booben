'use strict';

import './RoutesList.scss';
import React, { PropTypes } from 'react';

export const RoutesList = props => {
    let className = 'routes-list-wrapper';

    return (
        <ul
            className={className}
        >
	        {props.children}
        </ul>
    );
};

RoutesList.propTypes = {
};

RoutesList.defaultProps = {
};

RoutesList.displayName = 'RoutesList';

export * from './RouteCard/RouteCard';
export * from './RouteNewButton/RouteNewButton';
export * from './RouteNewChildButton/RouteNewChildButton';
