import React from 'react';
import PropTypes from 'prop-types';

import {
  MenuOverlappingDividerStyled,
} from './styles/MenuOverlappingDividerStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const MenuOverlappingDivider = props => (
  <MenuOverlappingDividerStyled>
    {props.title}
  </MenuOverlappingDividerStyled>
);

MenuOverlappingDivider.displayName = 'MenuOverlappingDivider';
MenuOverlappingDivider.propTypes = propTypes;
MenuOverlappingDivider.defaultProps = defaultProps;

