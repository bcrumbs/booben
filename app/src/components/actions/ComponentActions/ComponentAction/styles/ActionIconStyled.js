'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import { actionConstants } from './constants';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

export const ActionIconStyled = styled.span`
  display: flex;
  margin-right: ${actionConstants.iconTextSpacing}px;
  width: ${actionConstants.headingIconSize}px;
  height: ${actionConstants.headingIconSize}px;
  line-height: ${actionConstants.headingIconSize}px;
  font-size: 16px;
`;

ActionIconStyled.propTypes = propTypes;
ActionIconStyled.defaultProps = defaultProps;
ActionIconStyled.displayName = 'ActionIconStyled';
