import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';
import { baseModule } from '../../../../styles/themeSelectors';

const propTypes = {
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  colorScheme: 'dark',
};

const colorScheme = ({ colorScheme }) => {
  const borderColor = constants[colorScheme].separatorColor;

  return css`
    border-top: ${constants.borderWidth}px solid ${borderColor};
  
    &::after {
      background-color: ${borderColor};
    }
  `;
};

export const TagWrapperStyled = styled.div`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  position: relative;
  margin-bottom: ${baseModule(1)}px;
  ${colorScheme}
  
  &::after {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${constants.borderWidth}px;
  }
`;

TagWrapperStyled.displayName = 'TagWrapperStyled';
TagWrapperStyled.propTypes = propTypes;
TagWrapperStyled.defaultProps = defaultProps;
