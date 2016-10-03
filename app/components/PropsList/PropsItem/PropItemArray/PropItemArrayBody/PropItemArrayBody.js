import React, { PropTypes } from 'react';

export const PropItemArrayBody = props => {
    let className = 'prop-array-body';

    return (
        <tbody className={className}>
            {props.children}
        </tbody>
    );
};

PropItemArrayBody.displayName = 'PropItemArrayBody';
