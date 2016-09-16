import React, { PropTypes } from 'react';

export const BlockContentBoxItem = props => {
    let className = `block-content-box-item`;
    if (props.isBordered) className += ' is-bordered';
    if (props.blank) className += ' is-blank';

    return (
        <div className={className}>
            {props.children}
        </div>
    );
};

BlockContentBoxItem.propTypes = {
    isBordered: PropTypes.bool,
    blank: PropTypes.bool
};

BlockContentBoxItem.defaultProps = {
    isBordered: false,
    blank: false
};

BlockContentBoxItem.displayName = 'BlockContentBoxItem';
