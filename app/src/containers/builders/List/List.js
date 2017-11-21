/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import PropTypes from 'prop-types';
import patchComponent from '../../../hocs/patchComponent';
import { returnNull } from '../../../utils/misc';
import withOverlay from '../../../hocs/withOverlay';

const propTypes = {
  data: PropTypes.array,
  component: PropTypes.func,
};

const defaultProps = {
  data: [],
  component: returnNull,
};

// TODO: where to move this?
export const CANVAS_IFRAME_ID = 'CANVAS_IFRAME_ID';
const getCanvasBody = () => {
  const iframe = document.getElementById(CANVAS_IFRAME_ID);
  const iframeDocument = iframe.contentDocument
    ? iframe.contentDocument
    : iframe.contentWindow.document;

  return iframeDocument.body;
};

const EmptyListOverlay = ({ rect }) =>
  <div
    id="strange things"
    style={{
      position: 'fixed',
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      background: 'grey',
      opacity: 0.7,
      pointerEvents: 'none',
    }}
  >
    text on overlay
  </div>;

const _List = props => {
  if (!props.data.length) {
    const canvasBody = getCanvasBody();
    const ComponentWithOverlay = withOverlay({
      OverlayComponent: EmptyListOverlay,
      mountTarget: canvasBody,
    })(props.component);
    return <ComponentWithOverlay />;
  }
  return props.data.map((item, idx) => (
    <props.component key={String(idx)} item={item} />
  ));
};

_List.propTypes = propTypes;
_List.defaultProps = defaultProps;
_List.displayName = 'List';

export const List = patchComponent(_List);
