import React, { PropTypes } from 'react';

export const PropItemArrayHeaderCell = props => {
    let className = 'prop-array-header-cell';

	if (props.align) className += ' ' + 'prop-array-cell-align-' + props.align;

    return (
        <td className={className}>{ props.children }</td>
    );
};

PropItemArrayHeaderCell.propTypes = {
	align: PropTypes.oneOf(['left', 'center', 'right'])
};

PropItemArrayHeaderCell.defaultProps = {
	align: 'left'
};

PropItemArrayHeaderCell.displayName = 'PropItemArrayHeaderCell';
