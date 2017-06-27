/**
 * @author Ekaterina Marova
 */

'use strict';

import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const OptionsListStyled = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 100%;
  padding: ${baseModule(1)}px 0;
`;

OptionsListStyled.displayName = 'OptionsListStyled';
