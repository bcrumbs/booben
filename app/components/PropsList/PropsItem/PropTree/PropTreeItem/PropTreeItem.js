import React, { PropTypes } from 'react';

import {
	Button
} from '@reactackle/reactackle';

import { PropsItem } from '../../PropsItem';

export const PropTreeItem = props => {
    let className = 'prop-tree-item',
	    contentClassName = 'prop-tree-item-content';

	let value = null;

	let icon = null;
	if (props.children) {
		icon =
			<div className="prop-tree-item-icon-left prop-tree-item-icon-collapse">
				<Button icon="chevron-down" />
			</div>;

		className += ' ' + 'has-sublevel';
		contentClassName += ' ' + 'has-icon-left';

		if (props.opened) {
			contentClassName += ' ' + 'sublevel-is-opened';
			className += ' ' + 'sublevel-is-opened';
		}
	}

	if (props.type === 'constructor') {
		icon =
			<div className="prop-tree-item-icon-left prop-tree-item-icon-remove">
				<Button icon="times" />
			</div>;

		contentClassName += ' ' + 'has-icon-left' + ' ' + 'prop-tree-item-type-constructor';
	}

	if (props.type === 'arrayItem') className += ' ' + 'is-flat-array';

	if (props.valueType && props.valueType === 'constructor') {

		value = <Button kind="link" text="Edit component"/>;

	} else if (props.valueType && props.valueType !== 'constructor' ){

		value = <PropsItem type={props.valueType} linkable label="set value"/>;

	} else {

		value = '';
		contentClassName += ' ' + 'value-not-settable';
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
	type: PropTypes.oneOf(['array', 'object', 'string', 'constructor', 'arrayItem']),
	opened: PropTypes.bool,
	valueType: PropTypes.oneOf([
		'input',
		'textarea',
		'list',
		'constructor',
		'constructor-toggle',
		'array',
		'tree',
		'toggle'
	]), // The same as for PropsItem
};

PropTreeItem.defaultProps = {
	title: '',
	type: 'object',
	opened: false,
	valueType: null
};

PropTreeItem.displayName = 'PropTreeItem';
