'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import { Button } from '@reactackle/reactackle';

import { noop } from '../../../../utils/misc';

export const PropLinkButton = props => (
	<div className="prop-item-actions-box">
		<div className="prop-item-action action-linking">
			<Button icon="link" onPress={props.onPress}/>
		</div>
	</div>
);

PropLinkButton.propTypes = {
	onPress: PropTypes.func
};

PropLinkButton.defaultProps = {
    onPress: noop
};

PropLinkButton.displayName = 'PropLinkButton';
