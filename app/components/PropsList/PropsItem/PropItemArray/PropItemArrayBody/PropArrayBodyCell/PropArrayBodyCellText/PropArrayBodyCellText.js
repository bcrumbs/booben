import React, { PropTypes } from 'react';

export const PropArrayBodyCellText = props => {
    let className = 'prop-array-body-cell-text';

    return (
        <div className={className}>
            { props.children }
        </div>
    );
};

PropArrayBodyCellText.propTypes = {
};

PropArrayBodyCellText.defaultProps = {
};

PropArrayBodyCellText.displayName = 'PropArrayBodyCellText';
