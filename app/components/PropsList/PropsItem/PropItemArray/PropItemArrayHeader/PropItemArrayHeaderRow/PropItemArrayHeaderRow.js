import React, { PropTypes } from 'react';

export const PropItemArrayHeaderRow = props => {
    let className = '';

    return (
        <tr className={className}>{ props.children }</tr>
    );
};

PropItemArrayHeaderRow.displayName = 'PropItemArrayHeaderRow';
