'use strict';

//noinspection JSUnresolvedVariable
import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  isBordered: PropTypes.bool,
};

const defaultProps = {
  isBordered: false,
};

export const BlockContentActions = props => {
  let className = 'block-content-actions-area';
  if (props.isBordered) className += ' is-bordered';

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentActions.propTypes = propTypes;
BlockContentActions.defaultProps = defaultProps;
BlockContentActions.displayName = 'BlockContentActions';

export * from './BlockContentActionsRegion/BlockContentActionsRegion';
