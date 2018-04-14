import React from 'react';
import PropTypes from 'prop-types';
import { TypeStyled } from './styles/TypeStyled';
import { TitleBoxStyled } from './styles/TitleBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';

const propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  type: PropTypes.string,
};

const defaultProps = {
  subtitle: '',
  type: '',
};

export const DataWindowTitle = props => {
  let type = null;
  if (props.type) {
    type = (
      <TypeStyled>
        {props.type}
      </TypeStyled>
    );
  }
  
  let subtitle = null;
  if (props.subtitle) {
    subtitle = (
      <SubtitleStyled>
        {props.subtitle}
      </SubtitleStyled>
    );
  }
  
  return (
    <TitleBoxStyled>
      <TitleStyled>
        {props.title}
      </TitleStyled>
      {type}
      {subtitle}
    </TitleBoxStyled>
  );
};

DataWindowTitle.propTypes = propTypes;
DataWindowTitle.defaultProps = defaultProps;
DataWindowTitle.displayName = 'DataWindowTitle';
