import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

const propTypes = {
  bordered: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  bordered: false,
  colorScheme: 'dark',
};

const bordered = ({ bordered, colorScheme }) => bordered
  ? css`border-top: 1px solid ${constants[colorScheme].blocksSeparatorColor};`
  : '';

const paddingTop = baseModule(3);
const paddingBottom = baseModule(2);
const paddingX = constants.basePaddingX;

export const BlockContentHeadingStyled = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 15px;
  padding: ${paddingTop}px ${paddingX}px ${paddingBottom}px;
  ${bordered}
`;

BlockContentHeadingStyled.propTypes = propTypes;
BlockContentHeadingStyled.defaultProps = defaultProps;
BlockContentHeadingStyled.displayName = 'BlockContentHeadingStyled';
