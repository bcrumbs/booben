'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { noop } from '../../../utils/misc';

import {
    Button,
    TooltipIcon
} from '@reactackle/reactackle';

export const DataItem = props => {
    let className = 'data-list-item';

    if (props.clickable) className += ' is-clickable';
    if (props.chosen) className += ' is-chosen';

    let tooltip = null,
        content = null,
        description = null,
        argsButton = null,
        actionsRight = null;
    
    if (props.tooltip) {
        tooltip = (
            <TooltipIcon text={props.tooltip} />
        );
    }
    
    if (props.argsButton) {
        argsButton =
            <div className="data-item_arguments-box">
                <Button
                    text="set arguments"
                    size="small"
                    narrow
                />
            </div>
    }
    
    if (props.connection) {
        actionsRight =
            <div className="data-item_actions data-item_actions-right">
                <div className="data-item_actions data-item_actions-right">
                    <Button icon="chevron-right" />
                </div>
            </div>
    }
    
    if (props.description) {
        description =
            <div className="data-item_description">
                {props.description}
            </div>
    }
    
    if (description || argsButton) {
        content =
            <div className="data-item_content">
                { description }
                { argsButton }
            </div>
    }

    const onClick = props.clickable ? props.onClick : noop;

    return (
        <div className={className} onClick={() => void onClick(props.arg)}>
            <div className='data-item_content-box'>
                <div className='data-item_title-box'>
                    <div className="data-item_title">
                        <span className="data-item_title-text">{props.title}</span>
                        <span className="data-item_type">{props.type}</span>
                        {tooltip}
                    </div>
                </div>
                
                { content }
            </div>
    
            { actionsRight }
        </div>
    );
};

DataItem.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    tooltip: PropTypes.string,
    clickable: PropTypes.bool,
    required: PropTypes.bool,
    argsButton: PropTypes.bool,
    argsRequired: PropTypes.bool,
    chosen: PropTypes.bool,
    connection: PropTypes.bool,
    arg: PropTypes.any,

    onClick: PropTypes.func
};

DataItem.defaultProps = {
    title: '',
    description: '',
    type: '',
    tooltip: '',
    clickable: false,
    required: false,
    argsButton: false,
    argsRequired: false,
    chosen: false,
    connection: false,
    arg: null,

    onClick: noop
};

DataItem.displayName = 'DataItem';
