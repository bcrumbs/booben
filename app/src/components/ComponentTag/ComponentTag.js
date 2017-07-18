'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { ComponentTagStyled } from './styles/ComponentTagStyled';
import { TagStyled } from './styles/TagStyled';
import { ImageStyled } from './styles/ImageStyled';
import { TitleStyled } from './styles/TitleStyled';

const propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  focused: PropTypes.bool,
};

const defaultProps = {
  image: '',
  title: '',
  focused: false,
};

export const ComponentTag = props => (
  <ComponentTagStyled focused={props.focused}>
    <TagStyled>
      <ImageStyled>
        <img src={props.image} alt="" role="presentation" />
      </ImageStyled>

      <TitleStyled focused={props.focused}>
        {props.title}
      </TitleStyled>
    </TagStyled>
  </ComponentTagStyled>
);

ComponentTag.propTypes = propTypes;
ComponentTag.defaultProps = defaultProps;
ComponentTag.displayName = 'ComponentTag';

export * from './ComponentTagWrapper/ComponentTagWrapper';
