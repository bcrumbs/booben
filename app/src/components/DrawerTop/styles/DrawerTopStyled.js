'use strict';

import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { animations } from '../../../styles/mixins';
import {
  colorMain,
  colorMainForeground,
} from '../../../styles/themeSelectors';

const propTypes = {
  fixed: PropTypes.bool,
};

const defaultProps = {
  fixed: false,
};

const fixed = ({ fixed }) => fixed
  ? css`
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    animation: ${animations.slideInDown} 200ms ease-out;
  `
  : '';

export const DrawerTopStyled = styled.div`
  width: 100%;
  min-height: 36px;
  background-color: ${colorMain};
  color: ${colorMainForeground};
  ${fixed}
`;

DrawerTopStyled.displayName = 'DrawerTopStyled';
DrawerTopStyled.propTypes = propTypes;
DrawerTopStyled.defaultProps = defaultProps;
