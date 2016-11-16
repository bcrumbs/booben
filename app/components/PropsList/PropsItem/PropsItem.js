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
	PropItemArray,
	PropItemArrayHeader,
	PropItemArrayHeaderRow,
	PropItemArrayHeaderCell,
	PropItemArrayBody,
	PropArrayBodyRow,
	PropArrayBodyCell,
	PropArrayBodyCellText
} from './PropItemArray/PropItemArray';

import {
	PropTree,
	PropTreeList,
	PropTreeItem
} from './PropTree/PropTree';

import {PropLabel} from './PropLabel/PropLabel';
import {PropLinkButton} from './PropLinkButton/PropLinkButton';

import {PropConstructor} from './PropConstructor/PropConstructor';
import {PropArrayNewRow} from './PropItemArray/PropArrayNewRow/PropArrayNewRow';

import { noop } from '../../../utils/misc';

export const PropsItem = props => {
	let className = 'prop-item',
		wrapperClassName= 'prop-item-wrapper';

	if (props.view) className += ` prop-type-${props.view}`;
	if (props.subtreeOn) wrapperClassName += ' sublevel-is-visible';


	let image = null,
		iconLeft = null,
		iconRight = null,
		actionsRight = null;

	if (props.image) {
		image = (
			<div className="prop-item-image-box">
				<img src={props.image} />
			</div>
		);
	}

	if (props.view === 'constructor') {
		iconLeft =
			<div className="prop-item-icon prop-item-icon-left prop-item-icon-remove">
				<Button icon="times" />
			</div>;
	}

	if (props.children && props.view !== 'constructor-toggle' && props.view !== 'toggle') {
		iconRight =
			<div className="prop-item-icon prop-item-icon-right prop-item-icon-collapse">
				<Button icon="chevron-right" />
			</div>;

		className += ' ' + 'has-sublevel';

		if (props.opened) {
			wrapperClassName += ' ' + 'sublevel-is-opened';
			className += ' ' + 'sublevel-is-opened';
		}
	}

	if (props.linkable) {
		actionsRight = (
			<div className="prop-item-icon prop-item-icon-right prop-item-icon-collapse">
				<PropLinkButton
					onPress={props.onLink}
				/>
			</div>
		);
	}

	wrapperClassName +=
		image ? ' has-image' : '' +
		iconLeft ? ' has-icon-left' : '' +
		iconRight ? ' has-icon-right' : '' +
		actionsRight ? ' has-actions-right' : '';

	let label = null;
	if (
		props.label &&
		( props.view !== 'constructor' || props.view !== 'constructor-toggle' || props.view !== 'tree' || props.view !== 'array')
	) {
		label =
			<PropLabel
				label={props.label}
				type={props.type}
				tooltip={props.tooltip}
			/>;
	}

	/*
	 PROP TYPES
	 */
	let content = false;

	if (props.type === 'arrayOf') className += ' ' + 'is-flat-array';

	if (props.view === 'input') {
		content = (
			<Input
				dense
				value={props.value}
				disabled={props.disabled}
				onChange={props.onChange}
			/>
		);
	}
	else if (props.view === 'textarea') {
		content = (
			<Textarea
				dense
				value={props.value}
				disabled={props.disabled}
				onChange={props.onChange}
			/>
		);
	}
	else if (props.view === 'toggle') {
		actionsRight =
			<div className="prop-item-action prop_action-right">
				<ToggleButton
					checked={props.value}
					disabled={props.disabled}
					onCheck={props.onChange}
				/>
			</div>
	}
	else if (props.view === 'list') {
		content = (
			<SelectBox
				dense
				data={props.options}
				value={props.value}
				disabled={props.disabled}
				onSelect={props.onChange}
			/>
		);
	}
	else if (props.view === 'constructor') {
		content = (
			<PropConstructor
				buttonText={props.setComponentButtonText}
				onSetComponent={props.onChange}
			/>
		);
	}

	else if (props.view === 'constructor-toggle') {
		content =
			<PropConstructor
				label={props.label}
				type={props.type}
				tooltip={props.tooltip}
				buttonText={props.constructorButtonText}
				hasToggle />
	}

	else if (props.view === 'tree') {
		content = <PropTree />
	}

	else if (props.view === 'array') {
		content =
			<PropItemArray>
				<PropItemArrayHeader>
					<PropItemArrayHeaderRow>
						<PropItemArrayHeaderCell>Title</PropItemArrayHeaderCell>
						<PropItemArrayHeaderCell align="center">Sortable</PropItemArrayHeaderCell>
						<PropItemArrayHeaderCell />
					</PropItemArrayHeaderRow>
				</PropItemArrayHeader>
				<PropItemArrayBody>
					<PropArrayBodyRow>
						<PropArrayBodyCell>
							<PropConstructor label={'body 1-1'} />
						</PropArrayBodyCell>
						<PropArrayBodyCell align="center">
							<Checkbox />
						</PropArrayBodyCell>
						<PropArrayBodyCell clearing />
					</PropArrayBodyRow>
					<PropArrayBodyRow>
						<PropArrayBodyCell>
							<PropConstructor label={'body 2-1'} />
						</PropArrayBodyCell>
						<PropArrayBodyCell align="center">
							<Checkbox />
						</PropArrayBodyCell>
						<PropArrayBodyCell clearing />
					</PropArrayBodyRow>
				</PropItemArrayBody>
			</PropItemArray>
	}

	return (
		<div className={className}>
			<div className={wrapperClassName}>
				{ iconLeft }
				{ image }

				<div className="prop-item-content-box">
					{label}
					{content}
				</div>

				{ actionsRight }
				{ iconRight }
			</div>

			{props.children}
		</div>
	);
};

PropsItem.propTypes = {
	type: PropTypes.any,
	label: PropTypes.string,
	constructorButtonText: PropTypes.string,
	opened: PropTypes.bool,
	linkable: PropTypes.bool,
	value: PropTypes.any,
	view: PropTypes.oneOf([
		'input',
		'textarea',
		'list',
		'constructor',
		'constructor-toggle',
		'array',
		'tree',
		'toggle',
		'object'
	]),
	disabled: PropTypes.bool,
	image: PropTypes.string,
	subtreeOn: PropTypes.bool,
	options: PropTypes.array,
	tooltip: PropTypes.string,
	setComponentButtonText: PropTypes.string,

	onChange: PropTypes.func,
	onLink: PropTypes.func
};

PropsItem.defaultProps = {
	type: 'input',
	label: '',
	constructorButtonText: '',
	opened: false,
	linkable: false,
	value: null,
	view: null,
	disabled: false,
	image: '',
	subtreeOn: false,
	options: [],
	tooltip: null,
	setComponentButtonText: '',

	onChange: noop,
	onLink: noop
};

PropsItem.displayName = 'PropsItem';
