'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import './CanvasFrame.scss';

const propTypes = {
  iframeRef: PropTypes.func,
};

const defaultProps = {
  iframeRef: noop,
};

export const CanvasFrame = props => (
  <section className="preview-iframe-wrapper">
    <iframe
      className="preview-iframe"
      sandbox="allow-same-origin allow-scripts allow-pointer-lock"
      ref={props.iframeRef}
    />
  </section>
);

CanvasFrame.propTypes = propTypes;
CanvasFrame.defaultProps = defaultProps;
CanvasFrame.displayName = 'CanvasFrame';
