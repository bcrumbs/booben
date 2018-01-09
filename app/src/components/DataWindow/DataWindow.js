/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import PropTypes from 'prop-types';
import { DataWindowStyled } from './styles/DataWindowStyled';

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
    <DataWindowStyled style={style}>
      {props.children}
    </DataWindowStyled>
  );
};

DataWindow.propTypes = propTypes;
DataWindow.defaultProps = defaultProps;
DataWindow.displayName = 'DataWindow';

export * from './DataWindowTitle/DataWindowTitle';
export * from './DataWindowTitleActions/DataWindowTitleActions';
export * from './DataWindowHeadingButtons/DataWindowHeadingButtons';
export * from './DataWindowContentGroup/DataWindowContentGroup';
