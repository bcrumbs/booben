'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { RouteParameterStyled } from './styles/RouteParameterStyled';
import { ParameterTitleStyled } from './styles/ParameterTitleStyled';

const propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

const defaultProps = {
  title: '',
  description: '',
};

export const RouteParameter = props => (
  <RouteParameterStyled>
    <ParameterTitleStyled>{props.title}</ParameterTitleStyled>
    <span>{props.description}</span>
  </RouteParameterStyled>
);

RouteParameter.propTypes = propTypes;
RouteParameter.defaultProps = defaultProps;
RouteParameter.displayName = 'RouteParameter';
