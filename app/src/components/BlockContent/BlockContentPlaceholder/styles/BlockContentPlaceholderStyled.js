import styled from 'styled-components';
import PropTypes from 'prop-types';

const propTypes = {
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  colorScheme: 'default',
};

export const BlockContentPlaceholderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`;

BlockContentPlaceholderStyled.displayName = 'BlockContentPlaceholderStyled';
BlockContentPlaceholderStyled.propTypes = propTypes;
BlockContentPlaceholderStyled.defaultProps = defaultProps;
