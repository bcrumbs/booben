import React, { PropTypes } from 'react';

export const BlockContentBoxItem = props => {
    let className = `block-content-box-item`;
    if (props.isBordered) className += ' is-bordered';
    if (props.blank) className += ' is-blank';
    if (props.flexMain) className += ' flex-main';

    return (
        <div className={className}>
            {props.children}
        </div>
    );
};

BlockContentBoxItem.propTypes = {
    isBordered: PropTypes.bool,
    blank: PropTypes.bool,
	flexMain: PropTypes.bool // If true, flex-grpw will be st to '1' for this block
};

BlockContentBoxItem.defaultProps = {
    isBordered: false,
    blank: false,
	flexMain: false
};

BlockContentBoxItem.displayName = 'BlockContentBoxItem';
