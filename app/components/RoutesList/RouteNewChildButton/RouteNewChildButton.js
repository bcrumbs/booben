'use strict';

import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';

export const RouteNewChildButton = props => {
    let className = 'route-new-button route-new-child-button';

    return (
        <li
            className={className}
        >
	        <Button text="Add new child route" kind={'primary'}/>
        </li>
    );
};

RouteNewChildButton.propTypes = {
};

RouteNewChildButton.defaultProps = {
};

RouteNewChildButton.displayName = 'RouteNewChildButton';


