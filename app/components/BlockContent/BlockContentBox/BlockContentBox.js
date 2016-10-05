import React, { PropTypes } from 'react';

export const BlockContentBox = props => {
    let className = `block-content-box-area`;
    if (props.isBordered) className += ' is-bordered';
    if (props.flex) className += ' display-flex';

    return (
        <div className={className}>
            {props.children}
        </div>
    );

};

BlockContentBox.propTypes = {
    isBordered: PropTypes.bool,
    flex: PropTypes.bool
};

BlockContentBox.defaultProps = {
    isBordered: false,
	flex: false
};

BlockContentBox.displayName = 'BlockContentBox';

export * from './BlockContentBoxItem/BlockContentBoxItem'
export * from './BlockContentBoxHeading/BlockContentBoxHeading'
