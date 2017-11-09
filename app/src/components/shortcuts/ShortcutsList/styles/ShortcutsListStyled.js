import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

export const ShortcutsListStyled = styled.div`
  column-width: 260px;
  column-gap: ${baseModule(6)}px;
  column-count: 3;
  padding: ${baseModule(2)}px ${baseModule(4)}px;
`;

ShortcutsListStyled.displayName = 'ShortcutsListStyled';
