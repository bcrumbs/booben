'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  isBordered: PropTypes.bool,
  hidden: PropTypes.bool,
};

const defaultProps = {
  isBordered: false,
  hidden: false,
};

export const BlockContentBoxHeading = props => {
  let className = 'block-content-box-heading';
  if (props.isBordered) className += ' is-bordered';
  
  const style = {};
  if (props.hidden) style.display = 'none';

  return (
    <div className={className} style={style}>
      {props.children}
    </div>
  );
};

BlockContentBoxHeading.propTypes = propTypes;
BlockContentBoxHeading.defaultProps = defaultProps;
BlockContentBoxHeading.displayName = 'BlockContentBoxHeading';
