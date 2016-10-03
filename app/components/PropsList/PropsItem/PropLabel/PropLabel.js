import React, { PropTypes } from 'react';

export const PropLabel = props => {
    let className = 'prop-item-label';

    return (
	    <label className={className}>{props.label}</label>
    );
};

PropLabel.propTypes = {
	label: PropTypes.string
};

PropLabel.defaultProps = {
	label: ''
};

PropLabel.displayName = 'PropLabel';



