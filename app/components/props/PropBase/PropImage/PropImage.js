/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
};

const defaultProps = {
  src: '',
  alt: '',
};

export const PropImage = ({ src, alt }) => (
  <div className="prop-item-image-box">
    <img src={src} alt={alt} />
  </div>
);

PropImage.propTypes = propTypes;
PropImage.defaultProps = defaultProps;
PropImage.diplayName = 'PropImage';
