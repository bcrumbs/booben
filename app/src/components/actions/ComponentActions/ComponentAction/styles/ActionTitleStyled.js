'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import {
  baseModule,
  fontSizeBody,
  textColorBody,
} from '../../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

export const ActionTitleStyled = styled.span`
  flex-grow: 1;
  font-size: ${fontSizeBody}px;
  line-height: 1.5;
  color: ${textColorBody};
  padding: ${baseModule(0.75)}px 0;
  display: inline-block;
`;

ActionTitleStyled.propTypes = propTypes;
ActionTitleStyled.defaultProps = defaultProps;
ActionTitleStyled.displayName = 'ActionTitleStyled';
