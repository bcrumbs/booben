import React, { PropTypes } from 'react';
import { Button, Tooltip } from '@reactackle/reactackle';

export const PageDrawerActionItem = props => {
    let className = `page-drawer-action-item`;
    if (props.isActive) className += ' is-active';

    let tooltip = null,
        button = null;

    if (props.icon) {
        button = <Button icon={props.icon} />;
        tooltip = <Tooltip text={props.title} />;
        className += ' has-tooltip';
    }
    else {
        button = <Button text={props.title} />;
    }

    return (
        <div className={className}>
            {button}
            {tooltip}
        </div>
    );
};

PageDrawerActionItem.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    isActive: PropTypes.bool
};

PageDrawerActionItem.defaultProps = {
    icon: null,
    title: null,
    isActive: false
};

PageDrawerActionItem.displayName = 'PageDrawerActionItem';
