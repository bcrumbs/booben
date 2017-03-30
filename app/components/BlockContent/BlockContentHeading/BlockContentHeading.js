'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  isBordered: PropTypes.bool,
};

const defaultProps = {
  isBordered: false,
};

export const BlockContentHeading = props => {
  let className = 'block-content_heading';
  if (props.isBordered) className += ' is-bordered';

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentHeading.propTypes = propTypes;
BlockContentHeading.defaultProps = defaultProps;
BlockContentHeading.displayName = 'BlockContentHeading';
