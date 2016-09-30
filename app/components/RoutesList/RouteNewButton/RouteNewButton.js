'use strict';

import React, { PropTypes } from 'react';

export const RouteNewButton = props => {
    let className = 'route-new-button';

    return (
        <div
            className='route-new-button-wrapper'
        >
	        <button className={className} tabIndex="1">
		        Add new root route
	        </button>
        </div>
    );
};

RouteNewButton.propTypes = {
};

RouteNewButton.defaultProps = {
};

RouteNewButton.displayName = 'RouteNewButton';


