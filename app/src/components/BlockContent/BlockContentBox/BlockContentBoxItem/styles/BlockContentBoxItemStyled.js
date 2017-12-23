import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../../styles/constants';
import { baseModule } from '../../../../../styles/themeSelectors';

import {
  BlockContentBoxHeadingStyled,
} from '../../BlockContentBoxHeading/styles/BlockContentBoxHeadingStyled';

const propTypes = {
  bordered: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
  shading: PropTypes.oneOf(['default', 'editing', 'dim']),
};

const defaultProps = {
  bordered: false,
  colorScheme: 'default',
  shading: 'default',
};

const colorScheme = ({ colorScheme, shading }) => {
  const bgColor =
    constants[colorScheme].shading[shading].backgroundColor;

  return css`
    background-color: ${bgColor};
  `;
};

const bordered = ({ bordered, colorScheme }) => bordered
  ? css`border-top: 1px solid ${constants[colorScheme].blocksSeparatorColor};`
  : css`
    ${BlockContentBoxHeadingStyled} + & {
      padding-top: 0;
    }
  `;

const padding = ({ blank }) => {
  const paddingX = blank ? 0 : constants.basePaddingX;
  const paddingY = blank ? 0 : baseModule(2);

  return css`
    padding: ${paddingY}px ${paddingX}px;
    
    & & {
      margin-left: -${paddingX}px;
      margin-right: -${paddingX}px;
    }
  `;
};

const spread = ({ spread }) => spread ? 'flex-grow: 1;' : '';

const hasScrollY = ({ hasScrollY }) => hasScrollY
  ? 'overflow-y: auto;'
  : 'flex-shrink: 0;';

export const BlockContentBoxItemStyled = styled.div` 
  ${padding}
  ${bordered}
  ${spread}
  ${colorScheme}
  ${hasScrollY}
`;

BlockContentBoxItemStyled.propTypes = propTypes;
BlockContentBoxItemStyled.defaultProps = defaultProps;
BlockContentBoxItemStyled.displayName = 'BlockContentBoxItemStyled';
