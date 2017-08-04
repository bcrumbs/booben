'use strict';

import styled from 'styled-components';
import constants from '../../styles/constants';

import { baseModule } from '../../../../styles/themeSelectors';

export const TagWrapperStyled = styled.div`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  position: relative;
  border-top: ${constants.borderWidth}px solid ${constants.borderColor};
  margin-bottom: ${baseModule(1)}px;
  
  &::after {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${constants.borderWidth}px;
    background-color: ${constants.borderColor};
  }
`;

TagWrapperStyled.displayName = 'TagWrapperStyled';
