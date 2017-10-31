import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

const ICON_SIZE = 32;

const colorScheme = ({ colorScheme }) => css`
  color: ${constants[colorScheme].titleIcon.color};
`;

export const TitleIconStyled = styled.div`
  display: flex;
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  line-height: ${ICON_SIZE}px;
  font-size: 16px;
  margin-right: -${constants.basePaddingX}px;
  align-self: flex-start;
  margin-top: ${baseModule(0.5)}px;
  ${colorScheme}
`;

TitleIconStyled.displayName = 'TitleIconStyled';
TitleIconStyled.propTypes = propTypes;
TitleIconStyled.defaultProps = defaultProps;
