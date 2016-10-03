import React, { PropTypes } from 'react';

export const PropArrayBodyRow = props => {
    let className = 'prop-array-body-row';

    return (
        <tr className={className}>
            {props.children}
        </tr>
    );
};

PropArrayBodyRow.displayName = 'PropArrayBodyRow';
