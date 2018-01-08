import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { iconSizeMixin } from 'reactackle-core';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

const colorScheme = ({ colorScheme }) => css`
  color: ${constants[colorScheme].titleIcon.color};
`;

export const TitleIconStyled = styled.div`
  display: flex;
  font-size: 16px;
  margin-right: -${constants.basePaddingX}px;
  align-self: flex-start;
  margin-top: ${baseModule(0.5)}px;
  ${colorScheme}
  ${iconSizeMixin('32px')}
`;

TitleIconStyled.displayName = 'TitleIconStyled';
TitleIconStyled.propTypes = propTypes;
TitleIconStyled.defaultProps = defaultProps;
