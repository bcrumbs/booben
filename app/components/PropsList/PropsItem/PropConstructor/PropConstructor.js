'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
	Button,
	ToggleButton
} from '@reactackle/reactackle';

import { PropLabel } from '../PropLabel/PropLabel';

import { noop } from '../../../../utils/misc';

export const PropConstructor = props => {
	let toggle = null;
	if (props.hasToggle) {
		toggle = (
			<ToggleButton />
		);
	}

	return (
		<div className="prop-constructor-wrapper">
			<div className="prop-constructor-content">
				<div className="prop-constructor-button">
					<Button
						kind="link"
						text={props.buttonText}
						onPress={props.onSetComponent}
					/>
				</div>
			</div>

			{toggle}
		</div>
	);
};

PropConstructor.propTypes = {
	hasToggle: PropTypes.bool,
	buttonText: PropTypes.string,

	onSetComponent: PropTypes.func
};

PropConstructor.defaultProps = {
	hasToggle: false,
	buttonText: '',

	onSetComponent: noop
};

PropConstructor.displayName = 'PropConstructor';
