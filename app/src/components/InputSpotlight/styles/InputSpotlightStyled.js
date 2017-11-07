/**
 * @author Ekaterina Marova
 */

import styled from 'styled-components';
import { baseModule } from '../../../styles/themeSelectors';

export const InputSpotlightStyled = styled.div`
  min-width: 0;
  max-width: 100vw;
  max-height: 100vh;
  width: 400px;
  padding: ${baseModule(1)}px;
  box-sizing: border-box;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate3D(-50%, -50%, 0);
  z-index: 9999;
  display: flex;
`;

InputSpotlightStyled.displayName = 'InputSpotlightStyled';
