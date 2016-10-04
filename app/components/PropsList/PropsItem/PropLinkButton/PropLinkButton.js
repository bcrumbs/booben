import React, { PropTypes } from 'react';

import { Button } from '@reactackle/reactackle';

export const PropLinkButton = props => {

    return (
	    <div className="prop-item-actions-box">
		    <div className="prop-item-action action-linking">
			    <Button icon="link" size="small" />
		    </div>
	    </div>
    );
};

PropLinkButton.propTypes = {
};

PropLinkButton.defaultProps = {
};

PropLinkButton.displayName = 'PropLinkButton';



