import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import { CanvasFrameStyled } from './styles/CanvasFrameStyled';
import { FrameStyled } from './styles/FrameStyled';
import { CANVAS_IFRAME_ID } from '../../containers/builders/List/List';

const propTypes = {
  iframeRef: PropTypes.func,
};

const defaultProps = {
  iframeRef: noop,
};

export const CanvasFrame = props => (
  <CanvasFrameStyled>
    <FrameStyled
      id={CANVAS_IFRAME_ID}
      sandbox="allow-same-origin allow-scripts allow-pointer-lock"
      innerRef={props.iframeRef}
    />
  </CanvasFrameStyled>
);

CanvasFrame.propTypes = propTypes;
CanvasFrame.defaultProps = defaultProps;
CanvasFrame.displayName = 'CanvasFrame';
