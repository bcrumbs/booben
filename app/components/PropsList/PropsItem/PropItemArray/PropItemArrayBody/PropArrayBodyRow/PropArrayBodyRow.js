import React, { PropTypes } from 'react';

export const PropArrayBodyRow = props => {
    let className = 'prop-array-body-row';

	if (props.new) className+= ' ' + 'is-new';

    return (
        <tr className={className}>
            {props.children}
        </tr>
    );
};

PropArrayBodyRow.displayName = 'PropArrayBodyRow';
