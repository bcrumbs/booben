import React, { PropTypes } from 'react';

export const BlockContentBox = props => {
    let className = `block-content-box-area`;
    if (props.isBordered) className += ' is-bordered';

    return (
        <div className={className}>
            {props.children}
        </div>
    );

};

BlockContentBox.propTypes = {
    isBordered: PropTypes.bool
};

BlockContentBox.defaultProps = {
    isBordered: true
};

BlockContentBox.displayName = 'BlockContentBox';

export * from './BlockContentBoxItem/BlockContentBoxItem'
export * from './BlockContentBoxHeading/BlockContentBoxHeading'
