/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TitleWrapperStyled } from './styles/TitleWrapperStyled';
import { TitleStyled } from './styles/TitleStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const ComponentsTreeItemTitle = ({ title }) => (
  <TitleWrapperStyled>
    <TitleStyled>
      {title}
    </TitleStyled>
  </TitleWrapperStyled>
);

ComponentsTreeItemTitle.propTypes = propTypes;
ComponentsTreeItemTitle.defaultProps = defaultProps;
ComponentsTreeItemTitle.displayName = 'ComponentsTreeItemTitle';
