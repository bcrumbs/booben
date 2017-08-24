import React from 'react';
import PropTypes from 'prop-types';
import { TagWrapperStyled } from './styles/TagWrapperStyled';

const propTypes = {
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  colorScheme: 'dark',
};

export const ComponentTagWrapper = props => (
  <TagWrapperStyled colorScheme={props.colorScheme}>
    {props.children}
  </TagWrapperStyled>
);

ComponentTagWrapper.displayName = 'ComponentTagWrapper';
ComponentTagWrapper.propTypes = propTypes;
ComponentTagWrapper.defaultProps = defaultProps;
