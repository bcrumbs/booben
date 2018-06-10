import styled from 'styled-components';
import {
  baseModule,
  colorWhite,
  fontSizeSmall,
  fontWeightSemibold,
} from '../../../styles/themeSelectors';

export const WrapperStyled = styled.div`
  padding: ${baseModule(0.5)}px 0;
  display: flex;
  align-items: center;
  user-select: none;
  color: ${colorWhite};
  font-size: ${fontSizeSmall}px;
  font-weight: ${fontWeightSemibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
