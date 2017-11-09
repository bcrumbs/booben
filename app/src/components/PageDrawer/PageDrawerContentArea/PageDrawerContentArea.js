import React from 'react';
import PropTypes from 'prop-types';

import {
  PageDrawerContentAreaStyled,
} from './styles/PageDrawerContentAreaStyled';

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
    <PageDrawerContentAreaStyled style={style}>
      {props.children}
    </PageDrawerContentAreaStyled>
  );
};

PageDrawerContentArea.propTypes = propTypes;
PageDrawerContentArea.defaultProps = defaultProps;
PageDrawerContentArea.displayName = 'PageDrawerContentArea';
