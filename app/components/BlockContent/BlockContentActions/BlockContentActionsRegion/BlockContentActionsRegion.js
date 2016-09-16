import React, { PropTypes } from 'react';

export const BlockContentActionsRegion = props => {
    let className = `block-content-actions-region`;
    if (props.type) className += ' region-' + props.type;

    return (
        <div className={className}>
            {props.children}
        </div>
    );

};

BlockContentActionsRegion.propTypes = {
    type: PropTypes.oneOf(['main', 'secondary'])
};

BlockContentActionsRegion.defaultProps = {
    type: 'main'
};

BlockContentActionsRegion.displayName = 'BlockContentActionsRegion';
