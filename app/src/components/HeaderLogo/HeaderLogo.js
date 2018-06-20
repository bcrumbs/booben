import React from 'react';
import { WrapperStyled } from './styles';

export const HeaderLogo = props => (
  <WrapperStyled {...props}>
    <span>
      {props.children}
    </span>
  </WrapperStyled>
);
