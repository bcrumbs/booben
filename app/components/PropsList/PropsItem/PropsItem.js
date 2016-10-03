import React, { PropTypes } from 'react';

import {
	Button,
	Input,
	SelectBox,
	Textarea,
	ToggleButton
} from '@reactackle/reactackle';

import { PropItemArray } from './PropItemArray/PropItemArray';

export const PropsItem = props => {
    let className = 'prop-item';

	if (props.type) className += ' ' + 'prop-type-' + props.type;

	let actions = false;
	if (props.linkable) {
		actions =
			<div className="prop-item-actions-box">
				<div className="prop-item-action action-linking">
					<Button icon="link" />
				</div>
			</div>
	}

	const label =
		<label className="prop-item-label">{props.label}</label>

	let content = false;
	if (props.type === 'input') {
		content =
			<Input label={props.label} dense/>
	}

	else if (props.type === 'textarea') {
		content =
			<Textarea label={props.label} dense/>
	}

	else if (props.type === 'list') {
		content =
			<SelectBox label={props.label} dense/>
	}

	else if (props.type === 'toggle') {
		content =
			<ToggleButton label={props.label}/>
	}

	else if (props.type === 'constructor') {
		content =
			<div>
				{ label }
				<Button size="small" kind="text" text="Configure component"/>
			</div>
	}

	else if (props.type === 'array') {
		content = <PropItemArray />
	}


    return (
        <div className={className}>
	        <div className="prop-item-content-box">
	            { content }
	        </div>

	        { actions }
        </div>
    );
};

PropsItem.propTypes = {
	type:       PropTypes.oneOf(['input', 'textarea', 'list', 'constructor', 'array', 'toggle']),
	label:      PropTypes.string,
	linkable:   PropTypes.bool
};

PropsItem.defaultProps = {
	type:       'input',
	label:      '',
	linkable:   false
};

PropsItem.displayName = 'PropsItem';
