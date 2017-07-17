'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
  colorSecondary,
  colorTransparent,
  colorError,
  colorWhite,
} from '../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['error', 'success', 'progress', 'default']),
};

const defaultProps = {
  colorScheme: 'default',
};

const colorMap = {
  default: colorTransparent,
  progress: colorTransparent,
  error: colorError,
  success: colorTransparent,
};

const colorScheme = ({ colorScheme }) => css`
  background-color: ${colorMap[colorScheme]};
`;

export const ProjectSaveStyled = styled.div`
  display: flex;
  align-items: center;
  color: ${colorWhite};
  padding: 0 ${baseModule(2)}px 0 ${baseModule(1.5)}px;
  background-color: ${colorSecondary};
  user-select: none;
  position: relative;
  ${colorScheme}
  ${transition('background-color')}
`;

ProjectSaveStyled.displayName = 'ProjectSaveStyled';
ProjectSaveStyled.propTypes = propTypes;
ProjectSaveStyled.defaultProps = defaultProps;
