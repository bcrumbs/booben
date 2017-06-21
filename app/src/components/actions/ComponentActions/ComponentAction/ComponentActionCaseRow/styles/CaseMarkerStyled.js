'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { caseConstants } from './constants';

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

const type = ({ type }) => {
  const colors = {
    success: colorSuccess,
    error: colorError,
    neutral: colorInfo,
  };
  
  return css`background-color: ${colors[type]};`;
};

export const CaseMarkerStyled = styled.div`
  width: ${caseConstants.markerSize}px;
  height: ${caseConstants.markerSize}px;
  border-radius: 50%;
  display: block;
  margin-right: ${caseConstants.markerTitleSpacing}px;

  ${type}
`;

CaseMarkerStyled.propTypes = propTypes;
CaseMarkerStyled.defaultProps = defaultProps;
CaseMarkerStyled.displayName = 'CaseMarkerStyled';
