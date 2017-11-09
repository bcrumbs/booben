import styled from 'styled-components';
import { baseModule, textColorBody } from '../../../../styles/themeSelectors';

export const ShortcutsGroupStyled = styled.div`
  margin-bottom: ${baseModule(2)}px;
  color: ${textColorBody};
  break-inside: avoid;
`;

ShortcutsGroupStyled.displayName = 'ShortcutsGroupStyled';
