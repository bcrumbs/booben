'use strict';

import './RoutesList.scss';
import React, { PropTypes } from 'react';

export const RoutesList = props => {
    let className = 'routes-list-wrapper';

    return (
        <div
            className={className}
        >
	        {props.children}
        </div>
    );
};

RoutesList.propTypes = {
};

RoutesList.defaultProps = {
};

RoutesList.displayName = 'RoutesList';

export * from './RouteCard/RouteCard';
