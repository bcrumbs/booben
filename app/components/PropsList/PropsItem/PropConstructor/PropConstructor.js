import React, { PropTypes } from 'react';

import { Button } from '@reactackle/reactackle';
import { PropLabel } from '../PropLabel/PropLabel';

export const PropConstructor = props => {
    let className = 'prop-constructor-wrapper';

    return (
	    <div className={className}>
		    <PropLabel label={props.label} />
		    <Button kind="link" text="Configure component"/>
	    </div>
    );
};

PropConstructor.propTypes = {
	label: PropTypes.string
};

PropConstructor.defaultProps = {
	label: ''
};

PropConstructor.displayName = 'PropConstructor';



