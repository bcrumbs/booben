'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';

import './PreviewIFrame.scss';

const EVENTS_FOR_PARENT_FRAME = [
  'mousemove',
  'mouseup',
  'mousedown',
  'mouseover',
  'mouseout',
  'click',
];

export class PreviewIFrame extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    };

    this._iframe = null;

    this._saveIFrameRef = this._saveIFrameRef.bind(this);
  }

  componentDidMount() {
    const contentWindow = this._iframe.contentWindow,
      { store, interactive, containerStyle } = this.props;

        // Re-dispatch events from iframe to parent frame
    EVENTS_FOR_PARENT_FRAME.forEach(eventName => {
      contentWindow.addEventListener(eventName, event => {
        const boundingClientRect = this._iframe.getBoundingClientRect();

                // noinspection JSCheckFunctionSignatures
        const evt = new CustomEvent(eventName, {
          bubbles: true,
          cancelable: false,
        });

        evt.clientX = event.clientX + boundingClientRect.left;
        evt.clientY = event.clientY + boundingClientRect.top;
        evt.pageX = event.pageX + boundingClientRect.left;
        evt.pageY = event.pageY + boundingClientRect.top;
        evt._originalTarget = event.target;

        this._iframe.dispatchEvent(evt);
      });
    });

    contentWindow.addEventListener('DOMContentLoaded', () => {
      if (contentWindow.JSSY) {
                // noinspection JSCheckFunctionSignatures
        contentWindow.JSSY.initPreview({
          store,
          interactive,
          containerStyle,
        });
      } else {
                // TODO: Show warning?
      }

      this.setState({ loaded: true });
    });
  }

  componentWillUnmount() {
    this._iframe.contentWindow.JSSY.cleanup();
  }

  _saveIFrameRef(ref) {
    this._iframe = ref;
  }

  render() {
        // TODO: Render preloader if this.state.loaded === false

    return (
      <section className="preview-iframe-wrapper">
        <iframe
          ref={this._saveIFrameRef}
          src={this.props.url}
          className="preview-iframe"
        />
      </section>
    );
  }
}

PreviewIFrame.displayName = 'PreviewIFrame';

PreviewIFrame.propTypes = {
  url: PropTypes.string.isRequired,
  store: PropTypes.any,
  interactive: PropTypes.bool,
  containerStyle: PropTypes.string,
};

PreviewIFrame.defaultProps = {
  url: '',
  store: {},
  interactive: false,
  containerStyle: '',
};
