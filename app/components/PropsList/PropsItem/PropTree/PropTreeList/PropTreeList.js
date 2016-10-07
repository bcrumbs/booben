import React, { PropTypes } from 'react';

export const PropTreeList = props => {

	let addButton = null;
	if (props.childType === 'constructor') {

	}


	return (
		<div className='prop-tree-list'>
			{props.children}
		</div>
	);
};

PropTreeList.propTypes = {
	addButton: PropTypes.bool
};

PropTreeList.defaultProps = {
	addButton: false
};

PropTreeList.displayName = 'PropTreeList';
