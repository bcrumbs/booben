import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import _set from 'lodash.set';
import _get from 'lodash.get';
import store from '../../store';
import { CanvasFrame } from '../../components/CanvasFrame/CanvasFrame';
import { DocumentContext } from './DocumentContext/DocumentContext';
import CanvasContent from './content/containers/CanvasContent';
import Overlay from './content/containers/Overlay';
import dropZone from '../../hocs/dropZone';
import { connectDropZone } from '../ComponentsDragArea/ComponentsDragArea';
import { LOADED } from '../../constants/load-states';
import { CANVAS_CONTAINER_ID, CANVAS_OVERLAY_ID } from './content/constants';
import { ComponentDropAreas } from '../../actions/preview';
import { buildMutation } from '../../lib/graphql';
import ComponentsBundle from '../../lib/ComponentsBundle';

import {
  createApolloClient,
} from '../../lib/apollo';

import { waitFor } from '../../utils/misc';
import contentTemplate from './content/content.ejs';

/* eslint-disable react/no-unused-prop-types */
const propTypes = {
  projectName: PropTypes.string.isRequired,
  containerStyle: PropTypes.string,
  dropZoneId: PropTypes.string,
  onDropZoneReady: PropTypes.func.isRequired,
  onDropZoneSnap: PropTypes.func.isRequired,
  onDropZoneUnsnap: PropTypes.func.isRequired,
  onDropZoneOpenDropMenu: PropTypes.func.isRequired,
};
/* eslint-enable react/no-unused-prop-types */

const defaultProps = {
  containerStyle: '',
  dropZoneId: ComponentDropAreas.CANVAS,
};

const wrap = compose(connectDropZone, dropZone);

const MOUSE_EVENTS_FOR_PARENT_FRAME = [
  'mousemove',
  'mouseup',
  'click',
];

const KEYBOARD_EVENTS_FOR_PARENT_FRAME = [
  'keypress',
  'keydown',
  'keyup',
];

let token = null;
let canvas = null;

export const getComponentCoords = componentId => {
  if (!canvas) return null;
  return canvas._getComponentCoords(componentId);
};

class CanvasComponent extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._iframe = null;
    this._canvasContent = null;
    this._initialized = false;
    
    this.state = {
      error: null,
    };

    this._handleDrag = this._handleDrag.bind(this);
    this._handleEnter = this._handleEnter.bind(this);
    this._handleLeave = this._handleLeave.bind(this);
    this._handleDropMenuItemSelected =
      this._handleDropMenuItemSelected.bind(this);
    this._handleDropMenuClosed = this._handleDropMenuClosed.bind(this);
    this._handleSnap = this._handleSnap.bind(this);
    this._handleUnsnap = this._handleUnsnap.bind(this);
    this._handleOpenDropMenu = this._handleOpenDropMenu.bind(this);
    this._saveIFrameRef = this._saveIFrameRef.bind(this);
    this._saveCanvasContentRef = this._saveCanvasContentRef.bind(this);
  }
  
  componentDidMount() {
    const { dropZoneId, onDropZoneReady } = this.props;
  
    this._canvasInit()
      .then(() => {
        this._attachEventListeners();

        onDropZoneReady({
          id: dropZoneId,
          element: this._iframe,
          onDrag: this._handleDrag,
          onEnter: this._handleEnter,
          onLeave: this._handleLeave,
          onDropMenuItemSelected: this._handleDropMenuItemSelected,
          onDropMenuClosed: this._handleDropMenuClosed,
        });
  
        canvas = this;
      })
      .catch(error => {
        this.setState({ error });
      });
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.error !== this.state.error;
  }
  
  componentWillUnmount() {
    this._canvasCleanup();
    canvas = null;
  }
  
  _getComponentCoords(componentId) {
    if (!this._iframe) return null;
  
    const document = this._iframe.contentWindow.document;
    const selector = `[data-jssy-id="${componentId}"]`;
    const element = document.querySelector(selector);
    
    if (!element) return null;
    
    const elementRect = element.getBoundingClientRect();
    const iframeRect = this._iframe.getBoundingClientRect();
    
    return {
      x: iframeRect.left + elementRect.left,
      y: iframeRect.top + elementRect.top,
    };
  }
  
  _saveIFrameRef(ref) {
    this._iframe = ref;
  }

  _saveCanvasContentRef(ref) {
    this._canvasContent = ref ? ref.wrappedInstance : null;
  }
  
  _attachEventListeners() {
    const contentWindow = this._iframe.contentWindow;
    
    // Re-dispatch events from the iframe to the parent frame
    MOUSE_EVENTS_FOR_PARENT_FRAME.forEach(eventName => {
      contentWindow.document.addEventListener(eventName, event => {
        const boundingClientRect = this._iframe.getBoundingClientRect();
        const evt = new MouseEvent(eventName, {
          bubbles: true,
          cancelable: true,
          button: event.button,
          clientX: event.clientX + boundingClientRect.left,
          clientY: event.clientY + boundingClientRect.top,
          pageX: event.pageX + boundingClientRect.left,
          pageY: event.pageY + boundingClientRect.top,
          screenX: event.screenX,
          screenY: event.screenY,
        });
        
        this._iframe.dispatchEvent(evt);
      });
    });
    
    KEYBOARD_EVENTS_FOR_PARENT_FRAME.forEach(eventName => {
      contentWindow.document.addEventListener(eventName, event => {
        // Browsers ignore charCode, keyCode and which properties
        // in KeyboardEvent constructor, so we have to use CustomEvent
        // to simulate keyboard events with all its props.
        // https://bugs.webkit.org/show_bug.cgi?id=16735
        const evt = new CustomEvent(eventName, {
          bubbles: true,
          cancelable: true,
        });
  
        evt.key = event.key;
        evt.code = event.code;
        evt.location = event.location;
        evt.ctrlKey = event.ctrlKey;
        evt.shiftKey = event.shiftKey;
        evt.altKey = event.altKey;
        evt.metaKey = event.metaKey;
        evt.repeat = event.repeat;
        evt.isComposing = event.isComposing;
        evt.charCode = event.charCode;
        evt.keyCode = event.keyCode;
        evt.which = event.which;
  
        window.document.body.dispatchEvent(evt);
      });
    });
  }
  
  async _getApolloClient() {
    const state = store.getState();
  
    if (state.project.loadState !== LOADED) {
      throw new Error('Canvas#_getProvider() failed: Project is not loaded');
    }
    
    if (!state.project.data.graphQLEndpointURL) {
      return null;
    }

    const auth = state.project.data.auth;

    let authConfig = {};

    if (auth) {
      if (auth.type === 'jwt') {
        authConfig = {
          type: 'jwt',
          getToken: () => localStorage.getItem('jssy_auth_token'),
        };
      }
    }

    const client = createApolloClient(state.project.data, authConfig);
  
    if (auth) {
      if (auth.type === 'jwt') {
        const schema = state.project.schema;
        const haveCredentials = !!auth.username && !!auth.password;

        if (!token && schema && haveCredentials) {
          const selections = _set({}, auth.tokenPath, true);
          const mutation = buildMutation(
            schema,
            auth.loginMutation,
            selections,
          );

          const variables = {};

          _set(
            variables,
            [auth.username.argument, ...auth.username.path],
            auth.username.value,
          );

          _set(
            variables,
            [auth.password.argument, ...auth.password.path],
            auth.password.value,
          );

          try {
            const response = await client.mutate({ mutation, variables });

            token = _get(
              response.data,
              [auth.loginMutation, ...auth.tokenPath],
            );
          } catch (err) {
            token = null;
          }
        }
      }
    }
  
    return client;
  }
  
  async _canvasInit() {
    const { projectName, containerStyle } = this.props;
  
    if (this._initialized) return;
  
    const contentWindow = this._iframe.contentWindow;
    const documentIsReady = () =>
      contentWindow.document &&
      contentWindow.document.readyState === 'complete';
    
    await waitFor(documentIsReady);

    const document = contentWindow.document;
    const initialContent = contentTemplate({
      jssyContainerId: CANVAS_CONTAINER_ID,
      jssyOverlayId: CANVAS_OVERLAY_ID,
    });
  
    document.open('text/html', 'replace');
    document.write(initialContent);
    document.close();

    const options = {
      patchComponents: true,
    };

    const componentsBundle = new ComponentsBundle(projectName, contentWindow);
    await componentsBundle.loadComponents(options);
    
    const containerNode = document.getElementById(CANVAS_CONTAINER_ID);
    const overlayNode = document.getElementById(CANVAS_OVERLAY_ID);
    
    containerNode.setAttribute('style', containerStyle);
    
    const apolloClient = await this._getApolloClient();

    let previewContent = (
      <Provider store={store}>
        <DocumentContext window={contentWindow} document={document}>
          <CanvasContent
            ref={this._saveCanvasContentRef}
            componentsBundle={componentsBundle}
            onDropZoneSnap={this._handleSnap}
            onDropZoneUnsnap={this._handleUnsnap}
            onDropZoneOpenDropMenu={this._handleOpenDropMenu}
          />
        </DocumentContext>
      </Provider>
    );

    let overlayContent = (
      <Provider store={store}>
        <DocumentContext window={contentWindow} document={document}>
          <Overlay />
        </DocumentContext>
      </Provider>
    );
    
    if (apolloClient) {
      previewContent = (
        <ApolloProvider client={apolloClient}>
          {previewContent}
        </ApolloProvider>
      );
      overlayContent = (
        <ApolloProvider client={apolloClient}>
          {overlayContent}
        </ApolloProvider>
      );
    }
    const renderPreviewPromise = new Promise(resolve => {
      ReactDOM.render(
        previewContent,
        containerNode,
        () => void resolve(),
      );
    });

    const renderOverlayPromise = new Promise(resolve => {
      ReactDOM.render(
        overlayContent,
        overlayNode,
        () => void resolve(),
      );
    });

    await Promise.all([renderPreviewPromise, renderOverlayPromise]);
  
    this._initialized = true;
  }
  
  _canvasCleanup() {
    if (!this._initialized) return;

    const contentWindow = this._iframe.contentWindow;
    const document = contentWindow.document;
    const containerNode = document.getElementById(CANVAS_CONTAINER_ID);
    const overlayNode = document.getElementById(CANVAS_OVERLAY_ID);
  
    ReactDOM.unmountComponentAtNode(overlayNode);
    ReactDOM.unmountComponentAtNode(containerNode);
  
    this._initialized = false;
  }

  _handleDrag(data) {
    this._canvasContent.drag(data);
  }

  _handleEnter() {
    this._canvasContent.enter();
  }

  _handleLeave() {
    this._canvasContent.leave();
  }
  
  _handleDropMenuItemSelected(data) {
    this._canvasContent.dropMenuItemSelected(data);
  }
  
  _handleDropMenuClosed() {
    this._canvasContent.dropMenuClosed();
  }

  _handleSnap({ element }) {
    const { dropZoneId, onDropZoneSnap } = this.props;

    // The element comes from an iframe,
    // so left and top are already relative to the dropZone position
    const { left: x, top: y, width, height } = element.getBoundingClientRect();

    onDropZoneSnap({
      dropZoneId,
      element,
      x,
      y,
      width,
      height,
      hideTitle: true,
    });
  }

  _handleUnsnap() {
    const { dropZoneId, onDropZoneUnsnap } = this.props;
    onDropZoneUnsnap({ dropZoneId });
  }
  
  _handleOpenDropMenu({ coords, snapCoords, dropPointsData }) {
    const { dropZoneId, onDropZoneOpenDropMenu } = this.props;
    onDropZoneOpenDropMenu({ dropZoneId, coords, snapCoords, dropPointsData });
  }
  
  render() {
    const { error } = this.state;
    
    if (error) {
      // TODO: Render canvas error properly
      return (
        <div>
          Canvas initialization failed: {error.stack}
        </div>
      );
    }
    
    return (
      <CanvasFrame iframeRef={this._saveIFrameRef} />
    );
  }
}

CanvasComponent.propTypes = propTypes;
CanvasComponent.defaultProps = defaultProps;
CanvasComponent.displayName = 'Canvas';

export const Canvas = wrap(CanvasComponent);
