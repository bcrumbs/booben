import styled from 'styled-components';
import constants from './constants';
import { baseModule } from '../../../../styles/themeSelectors';

export const MarkWrapperStyled = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${constants.cardPaddingY}px ${constants.cardPaddingX}px;
  padding-left: 0;
  
  & > * + * {
    margin-top: ${baseModule(0.25)}px;
  }
`;

MarkWrapperStyled.displayName = 'MarkWrapperStyled';
