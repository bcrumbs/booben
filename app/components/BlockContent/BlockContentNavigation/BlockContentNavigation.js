'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  isBordered: PropTypes.bool,
};

const defaultProps = {
  isBordered: true,
};

export const BlockContentNavigation = props => {
  let className = 'block-content-navigation-area';
  if (props.isBordered) className += ' is-bordered';

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentNavigation.propTypes = propTypes;
BlockContentNavigation.defaultProps = defaultProps;
BlockContentNavigation.displayName = 'BlockContentNavigation';
