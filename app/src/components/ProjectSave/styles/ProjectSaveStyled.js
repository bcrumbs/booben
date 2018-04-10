import styled from 'styled-components';

import {
  baseModule,
} from '../../../styles/themeSelectors';

export const ProjectSaveStyled = styled.div`
  display: flex;
  align-items: center;
  padding: ${baseModule(0.25)}px ${baseModule(1)}px;
  user-select: none;
  position: relative;
`;

ProjectSaveStyled.displayName = 'ProjectSaveStyled';
