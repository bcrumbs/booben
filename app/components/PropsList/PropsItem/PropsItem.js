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

import {PropLabel} from './PropLabel/PropLabel';
import {PropLinkButton} from './PropLinkButton/PropLinkButton';

import {PropConstructor} from './PropConstructor/PropConstructor';
import {PropArrayNewRow} from './PropItemArray/PropArrayNewRow/PropArrayNewRow';

export const PropsItem = props => {
    let className = 'prop-item';

	if (props.type) className += ' ' + 'prop-type-' + props.type;

	let actions = false;
	if (props.linkable) {
		actions = <PropLinkButton />;
	}

	const label =
		<PropLabel>{props.label}</PropLabel>;

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
			<PropConstructor label={props.label} />
	}

	else if (props.type === 'array') {
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
