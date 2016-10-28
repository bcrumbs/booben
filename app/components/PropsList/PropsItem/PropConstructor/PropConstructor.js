import React, { PropTypes } from 'react';

import {
	Button,
	ToggleButton
} from '@reactackle/reactackle';

import { PropLabel } from '../PropLabel/PropLabel';

export const PropConstructor = props => {
    let className = 'prop-constructor-wrapper';

	let toggle = false;
	if (props.hasToggle) {
		toggle = <ToggleButton />
	}

    return (
	    <div className={className}>
		    <div className="prop-constructor-content">
			    <PropLabel label={props.label} tooltip={props.tooltip}/>

			    <div className="prop-constructor-button">
			        <Button kind="link" text="Set component"/>
			    </div>
		    </div>

		    { toggle }
	    </div>
    );
};

PropConstructor.propTypes = {
	label: PropTypes.string,
	tooltip: PropTypes.string,
	hasToggle: PropTypes.bool
};

PropConstructor.defaultProps = {
	label: '',
	tooltip: null,
	hasToggle: false
};

PropConstructor.displayName = 'PropConstructor';



