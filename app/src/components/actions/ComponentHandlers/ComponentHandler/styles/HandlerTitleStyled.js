'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import {
  fontSizeBody,
  textColorMedium,
  textColorBody,
  fontWeightSemibold,
} from '../../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

const active = ({ active }) => active
  ? `
    color: ${textColorBody};
    font-weight: ${fontWeightSemibold};  
  `
  : '';

export const HandlerTitleStyled = styled.div`
  flex-grow: 1;
  font-size: ${fontSizeBody}px;
  line-height: 1.5;
  color: ${textColorMedium};
  padding: 6px 0;
  
  ${active}
`;

HandlerTitleStyled.propTypes = propTypes;
HandlerTitleStyled.defaultProps = defaultProps;
HandlerTitleStyled.displayName = 'HandlerTitleStyled';
