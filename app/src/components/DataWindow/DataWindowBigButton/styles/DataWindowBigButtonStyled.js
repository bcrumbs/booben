'use strict';

import styled from 'styled-components';

export const DataWindowBigButtonStyled = styled.div`
  display: flex;
  width: 100%;
  
  & > * {
    flex-grow: 1;
    justofy-content: flex-end;
  }
`;

DataWindowBigButtonStyled.displayName = 'DataWindowBigButtonStyled';
