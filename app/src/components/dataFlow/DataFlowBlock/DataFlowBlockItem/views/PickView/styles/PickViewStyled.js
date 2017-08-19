'use strict';

import styled from 'styled-components';

export const PickViewStyled = styled.button`
  text-decoration: underline;
  padding: 0;
  margin: 0;
  outline: none;
  box-shadow: none;
  border: 0;
  background: transparent;
  width: 100%;
  text-align: center;
  cursor: pointer;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
  }
`;

PickViewStyled.displayName = 'PickViewStyled';
