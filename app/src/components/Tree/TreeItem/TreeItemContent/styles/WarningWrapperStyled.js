import styled from 'styled-components';
import { colorWarning } from '../../../../../styles/themeSelectors';

const size = 10;

export const WarningWrapperStyled = styled.div`
  display: block;
  width: ${size}px;
  height: ${size}px;
  border-radius: 50%;
  background-color: ${colorWarning};
  pointer-events: none;
`;

WarningWrapperStyled.displayName = 'WarningWrapperStyled';
