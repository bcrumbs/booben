'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  hidden: PropTypes.bool,
};

const defaultProps = {
  hidden: false,
};

export const PageDrawerContentArea = props => {
  const style = {};
  if (props.hidden) style.display = 'none';

  return (
    <div className="page-drawer-content" style={style}>
      {props.children}
    </div>
  );
};

PageDrawerContentArea.propTypes = propTypes;
PageDrawerContentArea.defaultProps = defaultProps;
PageDrawerContentArea.displayName = 'PageDrawerContentArea';
