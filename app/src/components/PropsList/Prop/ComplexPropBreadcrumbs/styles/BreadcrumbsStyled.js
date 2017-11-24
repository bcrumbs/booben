import styled from 'styled-components';
import { baseModule, colorBorder } from '../../../../../styles/themeSelectors';

export const BreadcrumbsStyled = styled.div`
  border-bottom: 1px solid ${colorBorder};
  margin-bottom: ${baseModule(1)}px;
`;

BreadcrumbsStyled.displayName = 'BreadcrumbsStyled';
