'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';

export const RouteNewButton = props => (
    <li className="route-new-button route-new-root-button" >
        <Button
            text={props.text}
            kind="outline-primary"
            tabIndex="1"
            onPress={props.onPress}
        />
    </li>
);

RouteNewButton.propTypes = {
    text: PropTypes.string,
    onPress: PropTypes.func
};

RouteNewButton.defaultProps = {
};

RouteNewButton.displayName = 'RouteNewButton';


