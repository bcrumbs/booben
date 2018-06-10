import styled from 'styled-components';
import {
  baseModule,
} from '../../../styles/themeSelectors';

export const WrapperStyled = styled.div`
  padding: ${baseModule(0.5)}px 0;
  display: flex;
  align-items: center;
  user-select: none;
`;
