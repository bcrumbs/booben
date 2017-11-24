import styled from 'styled-components';
import { fontSizeBody, baseModule } from '../../../styles/themeSelectors';

export const TitleStyled = styled.div`
  color: inherit;
  white-space: nowrap;
  padding: ${baseModule(0.25)}px 0;
  display: flex;
  align-items: center;
`;

TitleStyled.displayName = 'TitleStyled';
