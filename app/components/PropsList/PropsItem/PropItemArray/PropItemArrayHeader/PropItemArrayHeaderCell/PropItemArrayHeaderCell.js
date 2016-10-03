import React, { PropTypes } from 'react';

export const PropItemArrayHeaderCell = props => {
    let className = 'prop-array-header-cell';

    return (
        <td className={className}>{ props.children }</td>
    );
};

PropItemArrayHeaderCell.propTypes = {
};

PropItemArrayHeaderCell.defaultProps = {
};

PropItemArrayHeaderCell.displayName = 'PropItemArrayHeaderCell';
