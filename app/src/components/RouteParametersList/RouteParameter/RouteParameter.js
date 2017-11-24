import React from 'react';
import PropTypes from 'prop-types';
import { RouteParameterStyled } from './styles/RouteParameterStyled';
import { ParameterTitleStyled } from './styles/ParameterTitleStyled';

const propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
};

const defaultProps = {
  name: '',
  value: '',
};

export const RouteParameter = props => (
  <RouteParameterStyled>
    <ParameterTitleStyled>{props.name}</ParameterTitleStyled>
    <span>{props.value}</span>
  </RouteParameterStyled>
);

RouteParameter.propTypes = propTypes;
RouteParameter.defaultProps = defaultProps;
RouteParameter.displayName = 'RouteParameter';
