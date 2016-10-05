'use strict';

import React, { PropTypes } from 'react';

import {
	Button,
	Tooltip
} from '@reactackle/reactackle';

export const ComponentsTreeItem = props => {
	let className = `components-tree-item`;
	if (props.active) className += ' is-active';

	className += (props.showSublevel) ? ' sublevel-is-visible' : ' sublevel-is-hidden' ;

	let titleClassName = `components-tree-item-title-wrapper`;

	let tooltip = null;
	if (props.hasTooltip) {
		tooltip = <Tooltip text={props.title} />;
		titleClassName += ' has-tooltip';
	}

	let children = null,
		icon = null;
	if (props.children) {
		children =
			<div className="components-tree-item-sublevel">
				{ props.children }
			</div>;
		icon =
			<div className="components-tree-item-icon">
				<Button icon="chevron-down" />
			</div>;
		className += ' ' + 'has-sublevel';
	}

	return (
		<li className={ className }>
			<div className='components-tree-item-content'>
				{ icon }
				<button className={titleClassName}>
					<div className="components-tree-item-title">{ props.title }</div>
					{ tooltip }
				</button>
			</div>
			{ children }
		</li>
	)
};

ComponentsTreeItem.propTypes = {
	title: PropTypes.string,
	active: PropTypes.bool,
	hasTooltip: PropTypes.bool,
	showSublevel: PropTypes.bool
};

ComponentsTreeItem.defaultProps = {
	title: null,
	active: false,
	hasTooltip: false,
	showSublevel: false
};

ComponentsTreeItem.displayName = 'ComponentsTreeItem';

