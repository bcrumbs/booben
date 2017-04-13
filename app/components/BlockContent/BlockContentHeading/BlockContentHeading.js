'use strict';

import React from 'react';
import PropTypes from 'prop-types';

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
