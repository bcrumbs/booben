'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import { TooltipIcon } from '@reactackle/reactackle';

export const PropLabel = props => {
    let tooltip = null;
    if (props.tooltip) {
        tooltip = (
            <TooltipIcon text={props.tooltip} />
        );
    }

    return (
        <label className="prop-item-label">
            <div className="label-text">
                {props.label}
            </div>

            {tooltip}
        </label>
    );
};

PropLabel.propTypes = {
    label: PropTypes.string,
    tooltip: PropTypes.string
};

PropLabel.defaultProps = {
    label: '',
    tooltip: ''
};

PropLabel.displayName = 'PropLabel';
