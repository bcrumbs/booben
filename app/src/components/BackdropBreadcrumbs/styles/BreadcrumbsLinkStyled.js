'use strict';

import styled from 'styled-components';
import { textColorMedium } from '../../../styles/themeSelectors';

const propTypes = {};
const defaultProps = {};

export const BreadcrumbsLinkStyled = styled.div`  
  color: ${textColorMedium};

  &:focus {
    box-shadow: none;
    outline: none;
  }
`;

BreadcrumbsLinkStyled.propTypes = propTypes;
BreadcrumbsLinkStyled.defaultProps = defaultProps;
BreadcrumbsLinkStyled.displayName = 'BreadcrumbsLinkStyled';
