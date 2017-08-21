import styled from 'styled-components';

import {
  baseModule,
} from '../../../../../../styles/themeSelectors';

export const GraphQLGroupStyled = styled.div`
  width: 100%;
  
  & + & {
    margin-top: ${baseModule(1)}px;
  }
`;

GraphQLGroupStyled.displayName = 'GraphQLGroupStyled';
