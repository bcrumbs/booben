import React, { Component, PropTypes } from 'react';

export const PageDrawerActionsGroup = props => {
	let className = `page-drawer-actions-group`;

	return (
		<div className={className}>
			{props.children}
		</div>
	);

};

PageDrawerActionsGroup.displayName = 'PageDrawerActionsGroup';

