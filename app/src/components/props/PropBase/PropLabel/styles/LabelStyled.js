import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

import {
  fontSizeSmall,
  fontSizeBody,
  fontWeightNormal,
  textColorBody,
  textColorMediumDark,
} from '../../../../../styles/themeSelectors';

const propTypes = {
  positionTop: PropTypes.bool,
  itemCheckable: PropTypes.bool,
};

const defaultProps = {
  positionTop: false,
  itemCheckable: false,
};

// Negative margin is for visual balance
const position = ({ positionTop }) => positionTop
  ? css`
    color: ${textColorMediumDark};
    font-size: ${fontSizeSmall}px;
    margin-bottom: -4px;
  `
  : css`
    color: ${textColorBody};
    font-size: ${fontSizeBody}px;
    margin-bottom: 0;
  `;

// 2px is to compensate difference between the checkboxSize (18px) & label
// height
const itemCheckable = ({ itemCheckable }) => itemCheckable
  ? 'margin-top: 4px;'
  : '';

export const LabelStyled = styled.label`
  flex-grow: 1;
  line-height: 1.2;
  padding: 6px 0;
  font-weight: ${fontWeightNormal};
  position: relative;
  align-items: center;
  user-select: none;
  ${position}
  ${itemCheckable}
`;

LabelStyled.displayName = 'LabelStyled';
LabelStyled.propTypes = propTypes;
LabelStyled.defaultProps = defaultProps;
