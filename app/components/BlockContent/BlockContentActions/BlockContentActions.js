import React, { PropTypes } from 'react';

export const BlockContentActions = props => {
    let className = 'block-content-actions-area';
    if (props.isBordered) className += ' is-bordered';

    return (
        <div className={className}>
            {props.children}
        </div>
    );

};

BlockContentActions.propTypes = {
    isBordered: PropTypes.bool
};

BlockContentActions.defaultProps = {
    isBordered: false
};

BlockContentActions.displayName = 'BlockContentActions';

export * from './BlockContentActionsRegion/BlockContentActionsRegion'
