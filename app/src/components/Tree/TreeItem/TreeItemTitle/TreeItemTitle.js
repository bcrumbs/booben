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

export const TreeItemTitle = ({ title }) => (
  <TitleWrapperStyled title={title}>
    <TitleStyled>
      {title}
    </TitleStyled>
  </TitleWrapperStyled>
);

TreeItemTitle.propTypes = propTypes;
TreeItemTitle.defaultProps = defaultProps;
