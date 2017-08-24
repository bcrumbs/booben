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
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  image: '',
  title: '',
  focused: false,
  colorScheme: 'dark',
};

export const ComponentTag = props => (
  <ComponentTagStyled focused={props.focused} colorScheme={props.colorScheme}>
    <TagStyled>
      <ImageStyled>
        <img src={props.image} alt="" role="presentation" />
      </ImageStyled>

      <TitleStyled focused={props.focused} colorScheme={props.colorScheme}>
        {props.title}
      </TitleStyled>
    </TagStyled>
  </ComponentTagStyled>
);

ComponentTag.propTypes = propTypes;
ComponentTag.defaultProps = defaultProps;
ComponentTag.displayName = 'ComponentTag';

export * from './ComponentTagWrapper/ComponentTagWrapper';
