'use strict';

import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';

export const RouteNewButton = props => {
    let className = 'route-new-button route-new-root-button';

    return (
        <li className={className} >
	        <Button text="New route" kind="outline-primary"/>
        </li>
    );
};

RouteNewButton.propTypes = {
};

RouteNewButton.defaultProps = {
};

RouteNewButton.displayName = 'RouteNewButton';


