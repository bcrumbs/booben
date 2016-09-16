import React, { PropTypes } from 'react';
import { Icon, Tooltip } from '@reactackle/reactackle';

export const BlockContentShortcut = props => {
    let className = 'block-content-shortcut';

    let icon = null,
        text = null,
        tooltip = null;

    if (props.icon) {
        icon = <Icon name={props.icon} />;
        tooltip = <Tooltip text={props.title} />;
    }
    else {
        className += ' shortcut-without-icon';

        text = (
            <span className="shortcut-text">
                {props.title}
            </span>
        )
    }

    return (
        <div className={className}>
            {icon}
            {text}
            {tooltip}
        </div>
    );

};

BlockContentShortcut.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string.isRequired
};

BlockContentShortcut.defaultProps = {
    icon: '',
    title: ''
};

BlockContentShortcut.displayName = 'BlockContentShortcut';
