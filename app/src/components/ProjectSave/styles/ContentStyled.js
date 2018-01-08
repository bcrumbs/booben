import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from 'reactackle-core';

import {
  baseModule,
  radiusDefault,
  colorError,
  colorWhite,
  paletteBlueGrey300,
  fontSizeSmall,
} from '../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['error', 'success', 'progress', 'default']),
};

const defaultProps = {
  colorScheme: 'default',
};

const DEFAULT_TEXT_COLOR = paletteBlueGrey300,
  DEFAULT_BG_COLOR = 'rgba(0, 0, 0, 0.15)';

const colorMap = {
  default: {
    bgColor: DEFAULT_BG_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
  },
  progress: {
    bgColor: DEFAULT_BG_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
  },
  error: {
    bgColor: colorError,
    textColor: colorWhite,
  },
  success: {
    bgColor: DEFAULT_BG_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
  },
};

const colorScheme = ({ colorScheme }) => css`
  background-color: ${colorMap[colorScheme].bgColor};
  color: ${colorMap[colorScheme].textColor};
`;

export const ContentStyled = styled.div`
  display: flex;
  align-items: center;
  padding: ${baseModule(0.125)}px ${baseModule(0.75)}px;
  padding-right: ${baseModule(1)}px;
  user-select: none;
  position: relative;
  border-radius: ${radiusDefault}px;
  border: 1px solid rgba(255,255,255,0.1);
  font-size: ${fontSizeSmall}px;
  ${colorScheme}
  ${transition('background-color')}
`;

ContentStyled.displayName = 'ContentStyled';
ContentStyled.propTypes = propTypes;
ContentStyled.defaultProps = defaultProps;
