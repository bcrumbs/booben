'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  isBordered: PropTypes.bool,
};

const defaultProps = {
  isBordered: false,
};

export const BlockContentBoxHeading = props => {
  let className = 'block-content-box-heading';
  if (props.isBordered) className += ' is-bordered';

  return (
    <div className={className}>
      {props.children}
    </div>
  );
};

BlockContentBoxHeading.propTypes = propTypes;
BlockContentBoxHeading.defaultProps = defaultProps;
BlockContentBoxHeading.displayName = 'BlockContentBoxHeading';
