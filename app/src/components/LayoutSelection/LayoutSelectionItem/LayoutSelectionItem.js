'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { LayoutItemStyled } from './styles/LayoutItemStyled';
import { ImageBoxStyled } from './styles/ImageBoxStyled';
import { TitleBoxStyled } from './styles/TitleBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';

const propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

const defaultProps = {
  image: '',
  title: '',
  subtitle: '',
};

export const LayoutSelectionItem = props => {
  let subtitle = null;
  if (props.subtitle) {
    subtitle = (
      <SubtitleStyled>
        {props.subtitle}
      </SubtitleStyled>
    );
  }

  return (
    <LayoutItemStyled>
      <ImageBoxStyled>
        <img src={props.image} alt="" role="presentation" />
      </ImageBoxStyled>
      
      <TitleBoxStyled>
        <TitleStyled>{props.title}</TitleStyled>
        {subtitle}
      </TitleBoxStyled>
    </LayoutItemStyled>
  );
};

LayoutSelectionItem.propTypes = propTypes;
LayoutSelectionItem.defaultProps = defaultProps;
LayoutSelectionItem.displayName = 'LayoutSelectionItem';
