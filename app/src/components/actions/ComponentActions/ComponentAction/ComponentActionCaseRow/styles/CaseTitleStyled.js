'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  fontSizeXSmall,
  textColorMedium,
  fontWeightSemibold,
} from '../../../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

export const CaseTitleStyled = styled.div`
  flex-grow: 1;
  font-size: ${fontSizeXSmall}px;
  color: ${textColorMedium};
  text-transform: uppercase;
  font-weight: ${fontWeightSemibold};
`;

CaseTitleStyled.propTypes = propTypes;
CaseTitleStyled.defaultProps = defaultProps;
CaseTitleStyled.displayName = 'CaseTitleStyled';
