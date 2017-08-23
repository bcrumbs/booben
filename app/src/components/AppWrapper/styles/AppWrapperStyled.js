'use strict';

import styled from 'styled-components';

export const AppWrapperStyled = styled.div`
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-grow: 1;
  overflow-y: auto;
`;

AppWrapperStyled.displayName = 'AppWrapperStyled';
