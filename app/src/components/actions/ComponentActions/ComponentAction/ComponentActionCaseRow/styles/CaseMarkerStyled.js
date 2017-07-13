'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from './constants';

import {
  colorSuccess,
  colorError,
  colorInfo,
} from '../../../../../../styles/themeSelectors';

const propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'neutral']),
  title: PropTypes.string,
};

const defaultProps = {
  type: 'success',
  title: '',
};

const colors = {
  success: colorSuccess,
  error: colorError,
  neutral: colorInfo,
};

const type = ({ type }) => css`
  background-color: ${colors[type]};
`;

export const CaseMarkerStyled = styled.div`
  width: ${constants.markerSize}px;
  height: ${constants.markerSize}px;
  border-radius: 50%;
  display: block;
  margin-right: ${constants.markerTitleSpacing}px;
  ${type}
`;

CaseMarkerStyled.propTypes = propTypes;
CaseMarkerStyled.defaultProps = defaultProps;
CaseMarkerStyled.displayName = 'CaseMarkerStyled';
