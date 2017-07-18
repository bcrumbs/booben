'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';

import {
  baseModule,
  fontSizeSmall,
  textColorMedium,
} from '../../../styles/themeSelectors';

const propTypes = {
  active: PropTypes.bool,
  typeProgress: PropTypes.bool,
};

const defaultProps = {
  active: false,
  typeProgress: false,
};

export const ArtboardDataStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  line-height: 1;
  color: ${textColorMedium};
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  transform: translateY(-100%);
  pointer-events: none;
  padding: ${baseModule(1)}px 0;
  user-select: none;
`;

ArtboardDataStyled.displayName = 'ArtboardDataStyled';
ArtboardDataStyled.propTypes = propTypes;
ArtboardDataStyled.defaultProps = defaultProps;
