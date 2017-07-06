'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { transition, animations } from '@reactackle/reactackle';
import { baseModule, colorWhite } from '../../../styles/themeSelectors';
import { iconSize } from '../../../styles/mixins';

const propTypes = {
  active: PropTypes.bool,
  typeProgress: PropTypes.bool,
};

const defaultProps = {
  active: false,
  typeProgress: false,
};

const outerSize = '24px',
  imgSize = '12px',
  borderWidth = '1px';

const active = ({ active }) => `opacity: ${active ? 1 : 0.5};`;

const typeProgress = ({ typeProgress }) => typeProgress
  ? `
    border-right-color: transparent;
    animation-iteration-count: infinite;
    animation-duration: 1s;
    animation-name: ${animations.spin};
    animation-timing-function: linear;
  `
  : '';

export const IconStyled = styled.div`
  border-radius: 50%;
  border: 1px solid ${colorWhite};
  margin-right: ${baseModule(1)}px;
  position:relative;
  color: ${colorWhite};
  ${active}
  ${typeProgress}
  ${transition('opacity')};
  ${iconSize(outerSize, outerSize, imgSize, 'font')}

  & > * {
    position: absolute;
    top: -${borderWidth};
    left: -${borderWidth};
  }
`;

IconStyled.displayName = 'IconStyled';
IconStyled.propTypes = propTypes;
IconStyled.defaultProps = defaultProps;
