'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';

const propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

const defaultProps = {
  title: '',
  subtitle: '',
};

export const DataWindowContentGroup = props => (
  <div>
    <TitleStyled>
      {props.title}
    </TitleStyled>
    <SubtitleStyled>
      {props.subtitle}
    </SubtitleStyled>
    {props.children}
  </div>
);

DataWindowContentGroup.propTypes = propTypes;
DataWindowContentGroup.defaultProps = defaultProps;
DataWindowContentGroup.displayName = 'DataWindowContentGroup';
