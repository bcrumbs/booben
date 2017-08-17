'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { DrawerTopStyled } from './styles/DrawerTopStyled';
import { DrawerTopContentStyled } from './styles/DrawerTopContentStyled';

const propTypes = {
  fixed: PropTypes.bool,
};

const defaultProps = {
  fixed: false,
};

export const DrawerTop = ({ fixed, children }) => (
  <DrawerTopStyled fixed={fixed}>
    <DrawerTopContentStyled>
      {children}
    </DrawerTopContentStyled>
  </DrawerTopStyled>
);

DrawerTop.displayName = 'DrawerTop';
DrawerTop.propTypes = propTypes;
DrawerTop.defaultProps = defaultProps;
