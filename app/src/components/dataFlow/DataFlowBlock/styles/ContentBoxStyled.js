import styled from 'styled-components';

import {
  baseModule,
  textColorBody,
  fontSizeBody,
} from '../../../../styles/themeSelectors';

export const ContentBoxStyled = styled.div`
  width: 100%;
  color: ${textColorBody};
  font-size: ${fontSizeBody}px;
  
  &:empty {
    padding: 0;
  }
`;

ContentBoxStyled.displayName = 'ContentBoxStyled';
