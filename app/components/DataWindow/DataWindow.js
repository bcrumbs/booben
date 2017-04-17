/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import './DataWindow.scss';

const propTypes = {
  hidden: PropTypes.bool,
};

const defaultProps = {
  hidden: false,
};

export const DataWindow = props => {
  const style = {};
  
  if (props.hidden) style.display = 'none';
  
  return (
    <div className="data-window_content" style={style}>
      {props.children}
    </div>
  );
};

DataWindow.propTypes = propTypes;
DataWindow.defaultProps = defaultProps;
DataWindow.displayName = 'DataWindow';

export * from './DataWindowTitle/DataWindowTitle';
export * from './DataWindowHeadingButtons/DataWindowHeadingButtons';
export * from './DataWindowContentGroup/DataWindowContentGroup';
