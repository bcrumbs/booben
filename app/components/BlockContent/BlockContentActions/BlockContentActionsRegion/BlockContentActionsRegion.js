'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  type: PropTypes.oneOf(['main', 'secondary']),
};

const defaultProps = {
  type: 'main',
};

export const BlockContentActionsRegion = props => {
  let className = 'block-content-actions-region';
  if (props.type) className += ` region-${props.type}`;

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentActionsRegion.propTypes = propTypes;
BlockContentActionsRegion.defaultProps = defaultProps;
BlockContentActionsRegion.displayName = 'BlockContentActionsRegion';
