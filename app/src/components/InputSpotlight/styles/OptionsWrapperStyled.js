/**
 * @author Ekaterina Marova
 */

import styled from 'styled-components';
import { colorBorder } from '../../../styles/themeSelectors';

export const OptionsWrapperStyled = styled.div`
  width: 100%;
  border-top: 1px solid ${colorBorder};
  overflow-y: auto;
  overflow-x: hidden;
`;

OptionsWrapperStyled.displayName = 'OptionsWrapperStyled';
