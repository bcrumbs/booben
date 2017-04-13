/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

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
