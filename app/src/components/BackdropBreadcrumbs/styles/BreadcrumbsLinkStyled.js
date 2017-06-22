'use strict';

import styled from 'styled-components';
import { textColorMedium } from '../../../styles/themeSelectors';

export const BreadcrumbsLinkStyled = styled.div`  
  color: ${textColorMedium};

  &:focus {
    box-shadow: none;
    outline: none;
  }
`;

BreadcrumbsLinkStyled.displayName = 'BreadcrumbsLinkStyled';
