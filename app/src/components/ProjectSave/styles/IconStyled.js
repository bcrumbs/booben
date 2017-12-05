import styled from 'styled-components';
import PropTypes from 'prop-types';
import { transition, animations, iconSizeMixin } from '@reactackle/reactackle';
import { baseModule } from '../../../styles/themeSelectors';
import { iconSize } from '../../../styles/mixins';

const propTypes = {
  active: PropTypes.bool,
  typeProgress: PropTypes.bool,
};

const defaultProps = {
  active: false,
  typeProgress: false,
};

const outerSize = '15px';
const imgSize = '8px';
const borderWidth = '1px';

const active = ({ active }) => `opacity: ${active ? 0.8 : 0.5};`;

const typeProgress = ({ typeProgress }) => typeProgress
  ? `
    border-right-color: transparent;
    animation-iteration-count: infinite;
    animation-duration: 1s;
    animation-name: ${animations.spin};
    animation-timing-function: linear;
    border-width: 2px;
  `
  : '';

export const IconStyled = styled.div`
  border-radius: 50%;
  border: 1px solid currentColor;
  margin-right: ${baseModule(1)}px;
  position:relative;
  color: inherit;
  box-sizing: border-box;
  ${active}
  ${typeProgress}
  ${transition('opacity')};
  ${iconSizeMixin(outerSize, imgSize)}

  & > * {
    position: absolute;
    top: -${borderWidth};
    left: -${borderWidth};
  }
`;

IconStyled.displayName = 'IconStyled';
IconStyled.propTypes = propTypes;
IconStyled.defaultProps = defaultProps;
