'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
  DrawerTopPickingContentStyled,
} from './styles/DrawerTopPickingContentStyled';

import { TitleStyled } from './styles/TitleStyled';
import { ButtonWrapperStyled } from './styles/ButtonWrapperStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const DrawerTopPickingContent = props => (
  <DrawerTopPickingContentStyled>
    <TitleStyled>
      {props.title}
    </TitleStyled>
    
    <ButtonWrapperStyled>
      {props.children}
    </ButtonWrapperStyled>
  </DrawerTopPickingContentStyled>
);

DrawerTopPickingContent.propTypes = propTypes;
DrawerTopPickingContent.defaultProps = defaultProps;
DrawerTopPickingContent.displayName = 'DrawerTopPickingContent';
