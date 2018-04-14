import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { fontSizeBody, fontSizeBody2 } from '../../../../styles/themeSelectors';
import constants from '../styles/constants';

const propTypes = {
  index: PropTypes.bool,
};

const defaultProps = {
  index: false,
};

const index = ({ index }) => index
  ? css`
    font-size: ${fontSizeBody}px;
    line-height: 1.5;
  `
  : css`
    font-size: ${fontSizeBody2}px;
    line-height: ${constants.titleLineHeight};
  `;

export const TitleBoxStyled = styled.div`
  display: flex;
  ${index}
`;

TitleBoxStyled.displayName = 'TitleBoxStyled';
TitleBoxStyled.propTypes = propTypes;
TitleBoxStyled.defaultProps = defaultProps;
