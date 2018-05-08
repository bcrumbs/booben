import React from 'react';
import PropTypes from 'prop-types';

import {
  TitleWrapperStyled,
  TitleStyled,
} from './styles';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const RouteTreeItemTitle = ({ title }) => (
  <TitleWrapperStyled>
    <TitleStyled>
      {title}
    </TitleStyled>
  </TitleWrapperStyled>
);

RouteTreeItemTitle.propTypes = propTypes;
RouteTreeItemTitle.defaultProps = defaultProps;
