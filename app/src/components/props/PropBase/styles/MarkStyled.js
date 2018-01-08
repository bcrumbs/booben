import PropTypes from 'prop-types';
import styled from 'styled-components';
import { iconSizeMixin } from 'reactackle-core';

import {
  baseModule,
  paletteBlueGrey100,
  paletteBlueGrey600,
  colorSuccess,
  colorError,
  colorWhite,
} from '../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'error', 'success']),
};

const defaultProps = {
  colorScheme: 'default',
};

const colorMap = {
  default: {
    bgColor: paletteBlueGrey100,
    textColor: paletteBlueGrey600,
  },
  success: {
    bgColor: colorSuccess,
    textColor: colorWhite,
  },
  error: {
    bgColor: colorError,
    textColor: colorWhite,
  },
};

const markSize = baseModule(1.75);

const colorScheme = ({ colorScheme }) => {
  const key = colorScheme || 'default';

  return `
    background-color: ${colorMap[key].bgColor};
    color: ${colorMap[key].textColor};
  `;
};

export const MarkStyled = styled.div`
  border-radius: 50%;
  flex-shrink: 0;
  ${colorScheme}
  ${iconSizeMixin(`${markSize}px`, '8px')}
`;

MarkStyled.displayName = 'MarkStyled';
MarkStyled.propTypes = propTypes;
MarkStyled.defaultProps = defaultProps;
