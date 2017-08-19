'use strict';

import styled from 'styled-components';
import constants from '../../../styles/constants';

export const ComplexStyled = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);

  & > * {
    position: absolute;
    width: 50%;
    height: 50%;
  }
  
  div:first-child {
    background-color: ${constants.color.string};
    top: 0;
    left: 0;
  }
  
  div:nth-child(2) {
    background-color: ${constants.color.bool};
    top: 0;
    left: 50%;
  }
  
  div:nth-child(3) {
    background-color: ${constants.color.array};
    top: 50%;
    left: 0;
  }
  
  div:nth-child(4) {
    background-color: ${constants.color.number};
    top: 50%;
    left: 50%;
  }
  
`;

ComplexStyled.displayName = 'ComplexStyled';
