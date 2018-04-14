import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

const propTypes = {
  bordered: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  bordered: false,
  colorScheme: 'default',
};

const bordered = ({ bordered, colorScheme }) => bordered
  ? css`border-top: 1px solid ${constants[colorScheme].blocksSeparatorColor};`
  : '';

export const BlockContentActionsStyled = styled.div`
  flex-shrink: 0;
  display: flex;
  padding: ${baseModule(0.25)}px ${constants.basePaddingX}px;
  ${bordered}
`;

BlockContentActionsStyled.propTypes = propTypes;
BlockContentActionsStyled.defaultProps = defaultProps;
BlockContentActionsStyled.displayName = 'BlockContentActionsStyled';
