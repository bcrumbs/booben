import React, { Component, PropTypes } from 'react';

export const BlockContentBoxHeading = props => {
	let className = `block-content-box-heading`;

	if (props.isBordered) className += ' ' + 'is-bordered';

	return (
		<div className={className}>
			{props.children}
		</div>
	);

};

BlockContentBoxHeading.propTypes = {
	isBordered: PropTypes.bool
};

BlockContentBoxHeading.defaultProps = {
	isBordered: false
};
BlockContentBoxHeading.displayName = 'BlockContentBoxHeading';

