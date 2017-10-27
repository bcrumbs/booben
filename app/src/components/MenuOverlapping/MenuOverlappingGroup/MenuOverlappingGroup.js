import React from 'react';
import PropTypes from 'prop-types';

import {
  MenuOverlappingGroupStyled,
} from './styles/MenuOverlappingGroupStyled';

import {
  MenuOverlappingItemsListStyled,
} from './styles/MenuOverlappingItemsListStyled';

import {
  MenuOverlappingGroupHeading,
} from './MenuOverlappingGroupHeading/MenuOverlappingGroupHeading';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const MenuOverlappingGroup = props => (
  <MenuOverlappingGroupStyled>
    { props.title
      ? <MenuOverlappingGroupHeading>{props.title}</MenuOverlappingGroupHeading>
      : null
    }
    <MenuOverlappingItemsListStyled>
      {props.children}
    </MenuOverlappingItemsListStyled>
  </MenuOverlappingGroupStyled>
);

MenuOverlappingGroup.displayName = 'MenuOverlappingGroup';
MenuOverlappingGroup.propTypes = propTypes;
MenuOverlappingGroup.defaultProps = defaultProps;

export * from './MenuOverlappingGroupItem/MenuOverlappingGroupItem';
