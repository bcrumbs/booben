import styled from 'styled-components';
import { colorWarning } from '../../../../styles/themeSelectors';

const size = 10;

export const WarningStyled = styled.div`
  display: block;
  position: absolute;
  width: ${size}px;
  height: ${size}px;
  border-radius: 50%;
  background-color: ${colorWarning};
  left: 4px;
`;

WarningStyled.displayName = 'WarningStyled';
