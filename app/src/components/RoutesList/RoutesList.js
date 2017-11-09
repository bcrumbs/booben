import React from 'react';
import PropTypes from 'prop-types';
import { RoutesListStyled } from './styles/RoutesListStyled';

const propTypes = {
  focused: PropTypes.bool,
};

const defaultProps = {
  focused: false,
};

export const RoutesList = props => (
  <RoutesListStyled focused={props.focused}>
    {props.children}
  </RoutesListStyled>
);

RoutesList.displayName = 'RoutesList';
RoutesList.propTypes = propTypes;
RoutesList.defaultProps = defaultProps;

export * from './RoutesListWrapper/RoutesListWrapper';
export * from './RouteCard/RouteCard';
export * from './IndexRouteCard/IndexRouteCard';
export * from './RouteNewButton/RouteNewButton';
