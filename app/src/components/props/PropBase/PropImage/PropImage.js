import React from 'react';
import PropTypes from 'prop-types';
import { ImageBoxStyled } from './styles/ImageBoxStyled';

const propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};

const defaultProps = {
  src: '',
  alt: '',
};

export const PropImage = ({ src, alt }) => (
  <ImageBoxStyled>
    <img src={src} alt={alt} />
  </ImageBoxStyled>
);

PropImage.propTypes = propTypes;
PropImage.defaultProps = defaultProps;
PropImage.diplayName = 'PropImage';
