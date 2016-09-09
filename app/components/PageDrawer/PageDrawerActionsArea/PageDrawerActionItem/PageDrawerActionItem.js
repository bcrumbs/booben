import React, { Component, PropTypes } from 'react';
import {Button} from '@reactackle/reactackle';
import {Tooltip} from '@reactackle/reactackle';

export const PageDrawerActionItem = props => {
	let className = `page-drawer-action-item`;

	if (props.isActive) className += ' ' + 'is-active';

	let tooltip = null;
	if (props.icon) {
		tooltip = <Tooltip text={props.title} />
		className += ' ' + 'has-tooltip';
	}

	return (
		<div className={className}>
			<Button icon={props.icon} text={props.icon ? null : props.title}/>
			{tooltip}
		</div>
	);

};

PageDrawerActionItem.propTypes = {
	icon: PropTypes.string,
	title: PropTypes.string,
	isActive: PropTypes.bool
};

PageDrawerActionItem.defaultProps = {
	icon: null,
	title: null,
	isActive: false
};

PageDrawerActionItem.displayName = 'PageDrawerActionItem';

