'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
	Button,
	Checkbox,
	Input,
	SelectBox,
	Textarea,
	ToggleButton
} from '@reactackle/reactackle';

import {
	PropTreeBreadcrumbs,
	PropTreeList
} from './PropTree/PropTree';

import {PropLabel} from './PropLabel/PropLabel';
import {PropLinkButton} from './PropLinkButton/PropLinkButton';

import {PropConstructor} from './PropConstructor/PropConstructor';

import { noop } from '../../../utils/misc';

export const PropsItem = props => {
	let className = 'prop-item',
		wrapperClassName= 'prop-item-wrapper';

	if (props.view) className += ` prop-type-${props.view}`;
	if (props.subtreeOn) wrapperClassName += ' sublevel-is-visible';
	if (props.type === 'arrayOf') className += ' ' + 'is-flat-array';

	/*
		PROP VIEWS
	*/
	let content = false;

	if (props.view === 'input') {
		content = (
			<Input
				value={props.value}
				disabled={props.disabled}
				onChange={props.onChange}
			/>
		);
	}
	else if (props.view === 'textarea') {
		content = (
			<Textarea
				value={props.value}
				disabled={props.disabled}
				onChange={props.onChange}
			/>
		);
	}
	else if (props.view === 'list') {
		content = (
			<SelectBox
				data={props.options}
				value={props.value}
				disabled={props.disabled}
				onSelect={props.onChange}
			/>
		);
	}
	else if (props.view === 'constructor' || props.view === 'constructor-toggle' ) {
		content = (
			<PropConstructor
				buttonText={props.setComponentButtonText}
				onSetComponent={props.onChange}
			/>
		);
	}

	/*
		Common elements
	 */

	let toggle = null;
	if (props.view === 'toggle' || props.view === 'constructor-toggle') {
		toggle =
			<div className="prop_action prop_action-toggle">
				<ToggleButton
					checked={props.value}
					disabled={props.disabled}
					onCheck={props.onChange}
				/>
			</div>
	}

	let children = null;
	if (props.children) {
		children =
			props.view === 'tree' ?
				<PropTreeList
					addButton
				    newField={props.addNewField}
				>
					<PropTreeBreadcrumbs />
					{props.children}
				</PropTreeList>
				:
				props.children;
	}

	let label = null;
	if (
		props.label
	) {
		label =
			<PropLabel
				label={props.label}
				type={props.type}
				tooltip={props.tooltip}
			/>;
	}

	let image = null,
		iconLeft = null,
		actionsLeft = null,
		iconRight = null,
		actionsRight = null;

	if (props.image) {
		image = (
			<div className="prop-item-image-box">
				<img src={props.image} />
			</div>
		);
	}

	if (props.removable) {
		actionsLeft =
			<div className="prop_actions prop_actions-left">
				<div className="prop_action prop_action-collapse">
					<Button icon="times" />
				</div>
			</div>;
	}

	let collapsingAction = null,
		linkingAction = null;
	if (props.children && props.view !== 'constructor-toggle' && props.view !== 'toggle') {
		collapsingAction =
			<div className="prop_action prop_action-collapse">
				<Button icon="chevron-right" />
			</div>;

		className += ' ' + 'has-sublevel';
	}

	if (props.opened) {
		wrapperClassName += ' ' + 'sublevel-is-visible';
		className += ' ' + 'sublevel-is-visible';
	}

	if (props.linkable) {
		linkingAction = (
			<div className="prop_action prop_action-linking">
				<PropLinkButton
					onPress={props.onLink}
				/>
			</div>
		);
	}

	if(linkingAction || collapsingAction) {
		actionsRight =
			<div className="prop_actions prop_actions-right">
				{ toggle }
				{ collapsingAction }
				{ linkingAction }
			</div>
	}

	wrapperClassName +=
		image ? ' has-image' : '' +
		iconLeft ? ' has-icon-left' : '' +
		iconRight ? ' has-icon-right' : '' +
		actionsRight ? ' has-actions-right' : '';

	return (
		<div className={className}>
			<div className={wrapperClassName}>
				{ actionsLeft }
				{ iconLeft }
				{ image }

				<div className="prop-item-content-box">
					{label}
					{content}
				</div>

				{ actionsRight }
				{ iconRight }
			</div>

			{children}
		</div>
	);
};

PropsItem.propTypes = {
	type: PropTypes.any,
	view: PropTypes.oneOf([
		'input',
		'textarea',
		'list',
		'constructor',
		'constructor-toggle',
		'tree',
		'toggle'
	]),
	label: PropTypes.string.isRequired,
	value: PropTypes.any,
	image: PropTypes.string,
	tooltip: PropTypes.string,
	removable: PropTypes.bool,
	linkable: PropTypes.bool,
	disabled: PropTypes.bool,

	options: PropTypes.array,

	opened: PropTypes.bool,
	subtreeOn: PropTypes.bool,
	addNewField: PropTypes.bool,

	setComponentButtonText: PropTypes.string,

	onChange: PropTypes.func,
	onLink: PropTypes.func
};

PropsItem.defaultProps = {
	type: 'input',
	view: null,
	label: '',
	value: null,
	image: '',
	tooltip: null,
	removable: false,
	linkable: false,
	disabled: false,

	options: [],

	opened: false,
	subtreeOn: false,
	addNewField: false,

	setComponentButtonText: '',

	onChange: noop,
	onLink: noop
};

PropsItem.displayName = 'PropsItem';
