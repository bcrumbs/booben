'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import componentConstants from '../../styles/constants';
import { paletteBlueGrey400 } from '../../../../styles/themeSelectors';

const propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical']),
};

const defaultProps = {
  position: 'horizontal',
};

const position = ({ position }) => position === 'horizontal'
  ? `
    width: calc(100% - ${componentConstants}px);
    height: ${componentConstants}px;
    top: 0;
    left: ${componentConstants}px;
  `
  : `
    width: ${componentConstants}px;
    height: calc(100% - ${componentConstants}px);
    top: ${componentConstants}px;
    left: 0;
  `;

export const PaneRulerStyled = styled.div`
  background-color: ${paletteBlueGrey400};
  position: absolute;
  z-index: 9;
  ${position}
`;

PaneRulerStyled.displayName = 'PaneRulerStyled';
PaneRulerStyled.propTypes = propTypes;
PaneRulerStyled.defaultProps = defaultProps;
