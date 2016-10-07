import React, { PropTypes } from 'react';

import { Icon } from '@reactackle/reactackle';

export const PropTreeItem = props => {
    let className = 'prop-tree-item',
	    contentClassName = 'prop-tree-item-content';

	let value = null;

	let icon = null;
	if (props.children) {
		icon =
			<div className="prop-tree-item-icon prop-tree-item-icon-collapse">
				<Icon name="chevron-down" />
			</div>;

		className += ' ' + 'has-sublevel';

		if (props.opened) {
			contentClassName += ' ' + 'sublevel-is-opened';
			className += ' ' + 'sublevel-is-opened';
		}
	}

	if (props.type === 'constructor') {
		icon =
			<div className="prop-tree-item-icon prop-tree-item-icon-remove">
				<Icon name="times" />
			</div>;
	}

	if (props.type === 'array') {
		className += ' ' + 'is-flat-array';
	}

    return (
        <div className={className}>
	        <div className={contentClassName}>
		        { icon }
		        <div className='prop-tree-item-title-box'>
			        <div className="prop-tree-item-title">{props.title}</div>
			        <div className="prop-tree-item-type">{props.type}</div>
		        </div>
		        <div className="prop-tree-item-value-box">
			        { value }
		        </div>
	        </div>
            {props.children}
        </div>
    );
};

PropTreeItem.propTypes = {
	title: PropTypes.string,
	type: PropTypes.oneOf(['array', 'object', 'string', 'constructor']),
	opened: PropTypes.bool
};

PropTreeItem.defaultProps = {
	title: '',
	type: 'object',
	opened: false
};

PropTreeItem.displayName = 'PropTreeItem';
