import styled from 'styled-components';
import { colorWhite, colorBorder } from '../../../styles/themeSelectors';

export const ArtboardStyled = styled.div`
  background-color: ${colorWhite};
  border: 1px solid ${colorBorder};
  flex-shrink: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
`;

ArtboardStyled.displayName = 'ArtboardStyled';
