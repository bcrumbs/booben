'use strict';

import styled from 'styled-components';

const noSublevel = ({ noSublevel, theme }) => noSublevel
  ? `
    padding-left:
      ${theme.reactackle.components.button.size.normal.minHeight}px;
  `
  : '';

export const ItemContentStyled = styled.div`
  display: flex;
  align-items: center;
  max-width: 300px;
  ${noSublevel}
`;

ItemContentStyled.displayName = 'ItemContentStyled';
