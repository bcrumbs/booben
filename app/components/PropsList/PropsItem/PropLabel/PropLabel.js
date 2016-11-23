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

    let type = null;
    if (props.type) {
        type = (
            <span className="prop-item_type">
                {props.type}
            </span>
        );
    }

    return (
        <label className="prop-item-label">
            <div className="prop-item_label-wrapper">
                <span className="prop-item_label-text">
                    {props.label}
                </span>

                {type}
                {tooltip}
            </div>
        </label>
    );
};

PropLabel.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    tooltip: PropTypes.string
};

PropLabel.defaultProps = {
    label: '',
    type: '',
    tooltip: ''
};

PropLabel.displayName = 'PropLabel';
