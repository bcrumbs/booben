import styled from 'styled-components';

import {
  fontSizeSmall,
} from '../../../../../../styles/themeSelectors';

// TODO Remove classes after moving Breadcrumbs to SC
export const BreadcrumbsStyled = styled.div`
  .breadcrumbs-item-text {
    padding: 0;
  }
  
  .breadcrumbs-item-title {
    font-size: ${fontSizeSmall}px;
  }
  
  .breadcrumbs-separator {
    width: 1.5em;
    height: 1em;
    line-height: 1em;
  }
`;

BreadcrumbsStyled.displayName = 'BreadcrumbsStyled';
