import styled from 'styled-components';
import PropTypes from 'prop-types';
import { animations, iconSizeMixin } from 'reactackle-core';
import { baseModule } from '../../../styles/themeSelectors';

const propTypes = {
  active: PropTypes.bool,
  typeProgress: PropTypes.bool,
};

const defaultProps = {
  active: false,
  typeProgress: false,
};

const outerSize = '16px';
const imgSize = '12px';
const borderWidth = '1px';

const active = ({ active }) => `opacity: ${active ? 0.8 : 0.5};`;

const typeProgress = ({ typeProgress }) => typeProgress
  ? `
    border: 1px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation-iteration-count: infinite;
    animation-duration: 1s;
    animation-name: ${animations.spin};
    animation-timing-function: linear;
  `
  : '';

export const IconStyled = styled.div`
  margin-right: ${baseModule(0.5)}px;
  position:relative;
  box-sizing: border-box;
  ${active}
  ${typeProgress}
  ${iconSizeMixin(outerSize, imgSize)}

  & > * {
    position: absolute;
    top: -${borderWidth};
    left: -${borderWidth};
    width: ${outerSize};
    height: ${outerSize};
  }
`;

IconStyled.displayName = 'IconStyled';
IconStyled.propTypes = propTypes;
IconStyled.defaultProps = defaultProps;
