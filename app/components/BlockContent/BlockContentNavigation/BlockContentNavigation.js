import React, { PropTypes } from 'react';

export const BlockContentNavigation = props => {
    let className = 'block-content-navigation-area';
    if (props.isBordered) className += ' is-bordered';

    return (
        <div className={className}>
            {props.children}
        </div>
    );
};

BlockContentNavigation.propTypes = {
    isBordered: PropTypes.bool
};

BlockContentNavigation.defaultProps = {
    isBordered: true
};

BlockContentNavigation.displayName = 'BlockContentNavigation';
