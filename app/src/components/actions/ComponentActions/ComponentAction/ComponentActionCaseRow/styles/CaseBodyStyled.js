'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { caseConstants } from './constants';
import { colorBorder } from '../../../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

const paddingLeft =
  caseConstants.markerSize / 2 - caseConstants.borderThickness +
  caseConstants.markerTitleSpacing;

const marginLeft =
  caseConstants.markerSize / 2 - caseConstants.borderThickness / 2;

export const CaseBodyStyled = styled.div`
  padding-left: ${paddingLeft}px;
  margin-left: ${marginLeft}px;
  border-left: ${caseConstants.borderThickness}px solid ${colorBorder};
`;

CaseBodyStyled.propTypes = propTypes;
CaseBodyStyled.defaultProps = defaultProps;
CaseBodyStyled.displayName = 'CaseBodyStyled';
