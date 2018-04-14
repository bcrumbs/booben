import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';
import { fontSizeBody } from '../../../../styles/themeSelectors';

const propTypes = {
  bordered: PropTypes.bool,
  flex: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  bordered: false,
  flex: false,
  type: 'main',
  colorScheme: 'default',
};

/*
 * 'base' should be placed at a first place in the style export to provide
 * a correct work of the gradient background.
 * The gradient background simulates bottom border for content overflowing cases.
 */
const background = ({ colorScheme }) => {
  const color1 = constants[colorScheme].content.bgColor;
  const color1Transparent = 'transparent';
  const color2 = constants[colorScheme].blocksSeparatorColor;
  const color2Transparent = 'transparent';

  return css`
    background-color: ${constants[colorScheme].content.bgColor};
  `;
};

const bordered = ({ bordered, colorScheme }) => bordered
  ? css`border-top: 1px solid ${constants[colorScheme].blocksSeparatorColor};`
  : '';

const scrollable = ({ scrollable }) => scrollable
  ? 'overflow-y: auto;'
  : 'flex-shrink: 0;';

const flex = ({ flex }) => flex
  ? `
    display: flex;
    flex-direction: column;
  `
  : '';

const spread = ({ spread }) => spread && 'flex-grow: 1;';

export const BlockContentBoxAreaStyled = styled.div`
  ${background}
  font-size: ${fontSizeBody}px;
  flex-grow: 1;
  ${bordered}
  ${scrollable}
  ${flex}
  ${spread}
`;

BlockContentBoxAreaStyled.propTypes = propTypes;
BlockContentBoxAreaStyled.defaultProps = defaultProps;
BlockContentBoxAreaStyled.displayName = 'BlockContentBoxAreaStyled';
