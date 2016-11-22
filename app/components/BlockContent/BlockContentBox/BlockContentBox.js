import React, { PropTypes } from 'react';
import { autoScrollUpDown } from '../../../hocs/autoScrollUpDown';

const BlockContentBoxComponent = props => {
    let className = `block-content-box-area`;
    if (props.isBordered) className += ' is-bordered';
    if (props.flex) className += ' display-flex';

    return (
        <div
			className={className}
			ref={props.createElementRef}
			onMouseUp={props.onMouseUp}
		>
            {props.children}
        </div>
    );

};

BlockContentBoxComponent.propTypes = {
    isBordered: PropTypes.bool,
    flex: PropTypes.bool,
	onMouseUp: PropTypes.func,
	createElementRef: PropTypes.func
};

BlockContentBoxComponent.defaultProps = {
    isBordered: false,
	flex: false
};

BlockContentBoxComponent.displayName = 'BlockContentBox';

export const BlockContentBox = autoScrollUpDown(BlockContentBoxComponent);
export * from './BlockContentBoxItem/BlockContentBoxItem'
export * from './BlockContentBoxHeading/BlockContentBoxHeading'
