import React, { PropTypes } from 'react';

export const PropItemArrayHeader = props => {
    let className = 'prop-array-header';

    return (
        <thead className={className}>
            {props.children}
        </thead>
    );
};

PropItemArrayHeader.displayName = 'PropItemArrayHeader';
