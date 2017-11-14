import styled from 'styled-components';

import {
  baseModule,
  paletteBlueGrey600,
} from '../../../../styles/themeSelectors';

export const ShortcutItemStyled = styled.li`
  display: flex;
  padding: ${baseModule(0.5)}px 0;
  border-top: 1px dotted ${paletteBlueGrey600};
  
  &:first-child {
    border-top-width: 0;
  }
`;

ShortcutItemStyled.displayName = 'ShortcutItemStyled';
