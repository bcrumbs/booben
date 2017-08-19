'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GroupStyled } from './styles/GroupStyled';
import { TitleStyled } from './styles/TitleStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const BlockSelectionMenuGroup = ({ children, title }) => (
  <GroupStyled>
    {title && <TitleStyled>{title}</TitleStyled>}
    {children}
  </GroupStyled>
);

BlockSelectionMenuGroup.displayName = 'BlockSelectionMenuGroup';
BlockSelectionMenuGroup.propTypes = propTypes;
BlockSelectionMenuGroup.defaultProps = defaultProps;
