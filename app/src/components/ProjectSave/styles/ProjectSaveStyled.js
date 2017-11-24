import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
} from '../../../styles/themeSelectors';

export const ProjectSaveStyled = styled.div`
  display: flex;
  align-items: center;
  padding: ${baseModule(0.5)}px ${baseModule(1)}px;
  user-select: none;
  position: relative;
  ${transition('background-color')}
`;

ProjectSaveStyled.displayName = 'ProjectSaveStyled';
