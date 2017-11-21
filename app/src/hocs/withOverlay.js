/**
 * @author Nick Maltsev
 */

import React from 'react';
import { createPortal, findDOMNode } from 'react-dom';
import { toClassComponent } from '../utils/react';

export default ({ OverlayComponent, mountTarget }) => WrappedComponent => {
  const Component = toClassComponent(WrappedComponent);
  class WithOverlay extends React.Component {
    constructor(props) {
      super(props);
      this.handleComponentRef = this.handleComponentRef.bind(this);
    }

    handleComponentRef(ref) {
      this.component = ref ? findDOMNode(ref) : ref;
      this.renderOverlay();
    }

    renderOverlay() {
      if (!this.component) {
        this.overlay = null;
        this.forceUpdate();
        return;
      }
      const rect = this.component.getBoundingClientRect();
      const overlayElement = <OverlayComponent key="overlay" rect={rect} />;
      this.overlay = createPortal(overlayElement, mountTarget);
      this.forceUpdate();
    }

    render() {
      return [
        <Component key="targetComponent" ref={this.handleComponentRef} />,
        this.overlay,
      ];
    }
  }
  WithOverlay.displayName =
    `WithOverlay(${Component.displayName || 'Component'})`;

  return WithOverlay;
};
