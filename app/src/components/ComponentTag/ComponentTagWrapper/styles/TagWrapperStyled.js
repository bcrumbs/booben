import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import constants from '../../styles/constants';

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
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(100px,1fr));
  grid-gap: 0;
  grid-auto-rows: minmax(80px,auto);
  position: relative;
  margin-bottom: -${constants.borderWidth}px;
  ${colorScheme}
`;

TagWrapperStyled.displayName = 'TagWrapperStyled';
TagWrapperStyled.propTypes = propTypes;
TagWrapperStyled.defaultProps = defaultProps;
