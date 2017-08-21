import styled from 'styled-components';

import {
  baseModule,
  fontSizeBody,
} from '../../../styles/themeSelectors';

export const ContentStyled = styled.div`
  padding: ${baseModule(0.5)}px ${baseModule(1)}px;
  font-size: ${fontSizeBody}px;
`;

ContentStyled.displayName = 'ContentStyled';
