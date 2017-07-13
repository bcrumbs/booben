'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
  DrawerTopContentStyled,
} from './styles/DrawerTopContentStyled';

import { TitleStyled } from './styles/TitleStyled';
import { ButtonWrapperStyled } from './styles/ButtonWrapperStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const DrawerTopContent = props => (
  <DrawerTopContentStyled>
    <TitleStyled>
      {props.title}
    </TitleStyled>
    
    <ButtonWrapperStyled>
      {props.children}
    </ButtonWrapperStyled>
  </DrawerTopContentStyled>
);

DrawerTopContent.propTypes = propTypes;
DrawerTopContent.defaultProps = defaultProps;
DrawerTopContent.displayName = 'DrawerTopContent';
