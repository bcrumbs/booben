'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import _set from 'lodash.set';
import _get from 'lodash.get';

import store, {
  injectApolloMiddleware,
  removeApolloMiddleware,
} from '../../store';

import { CanvasFrame } from '../../components/CanvasFrame/CanvasFrame';
import { DocumentContext } from './DocumentContext/DocumentContext';
import { loadComponents } from './content/componentsLibrary';
import Preview from './content/containers/Preview';
import Overlay from './content/containers/Overlay';
import dropZone from '../../hocs/dropZone';
import { connectDropZone } from '../ComponentsDragArea/ComponentsDragArea';
import { URL_GRAPHQL_PREFIX } from '../../../../shared/constants';
import { LOADED } from '../../constants/loadStates';
import { CANVAS_CONTAINER_ID, CANVAS_OVERLAY_ID } from './content/constants';
import { ComponentDropAreas } from '../../actions/preview';
import { createReducer } from '../../reducers';
import { buildMutation } from '../../lib/graphql';
import { waitFor, returnNull } from '../../utils/misc';
import contentTemplate from './content/content.ejs';

/* eslint-disable react/no-unused-prop-types */
const propTypes = {
  projectName: PropTypes.string.isRequired,
  interactive: PropTypes.bool,
  containerStyle: PropTypes.string,
  dropZoneId: PropTypes.string,
  onDropZoneReady: PropTypes.func.isRequired,
  onDropZoneSnap: PropTypes.func.isRequired,
  onDropZoneUnsnap: PropTypes.func.isRequired,
  onDropZoneShowDropMenu: PropTypes.func.isRequired,
  onDropZoneHideDropMenu: PropTypes.func.isRequired,
};
/* eslint-enable react/no-unused-prop-types */

const defaultProps = {
  interactive: false,
  containerStyle: '',
  dropZoneId: ComponentDropAreas.CANVAS,
};

const wrap = compose(
  connectDropZone,
  dropZone,
);

const APOLLO_STATE_KEY = 'apollo';

const EVENTS_FOR_PARENT_FRAME = [
  'mousemove',
  'mouseup',
  'mousedown',
  'mouseover',
  'mouseout',
  'click',
];

const applyJWTMiddleware = (networkInterface, getToken) => {
  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) req.options.headers = {};
      const token = getToken();
      if (token) req.options.headers.Authorization = `Bearer ${token}`;
      next();
    },
  }]);
};

let token = null;
const getToken = () => token;
const getTokenFromLS = () => localStorage.getItem('jssy_auth_token');

let canvas = null;

export const getComponentCoords = componentId => {
  if (!canvas) return null;
  return canvas._getComponentCoords(componentId);
};

class CanvasComponent extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._iframe = null;
    this._preview = null;
    this._initialized = false;
    
    this.state = {
      error: null,
    };

    this._handleDrag = this._handleDrag.bind(this);
    this._handleEnter = this._handleEnter.bind(this);
    this._handleLeave = this._handleLeave.bind(this);
    this._handleDropMenuItemSelected =
      this._handleDropMenuItemSelected.bind(this);
    this._handleSnap = this._handleSnap.bind(this);
    this._handleUnsnap = this._handleUnsnap.bind(this);
    this._handleShowDropMenu = this._handleShowDropMenu.bind(this);
    this._handleHideDropMenu = this._handleHideDropMenu.bind(this);
    this._saveIFrameRef = this._saveIFrameRef.bind(this);
    this._savePreviewRef = this._savePreviewRef.bind(this);
  }
  
  componentDidMount() {
    const { dropZoneId, onDropZoneReady } = this.props;

    const contentWindow = this._iframe.contentWindow;
    
    // These modules are external in the components bundle
    contentWindow.React = React;
    contentWindow.ReactDOM = ReactDOM;
    contentWindow.PropTypes = PropTypes;
  
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
        });
  
        canvas = this;
      })
      .catch(error => {
        this.setState({ error });
      });
  }
  
  shouldComponentUpdate(_, nextState) {
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
    this._iframe = ref || null;
  }

  _savePreviewRef(ref) {
    this._preview = ref ? ref.getWrappedInstance() : null;
  }
  
  _attachEventListeners() {
    const contentWindow = this._iframe.contentWindow;
    
    // Re-dispatch events from the iframe to the parent frame
    EVENTS_FOR_PARENT_FRAME.forEach(eventName => {
      contentWindow.addEventListener(eventName, event => {
        const boundingClientRect = this._iframe.getBoundingClientRect();
        const evt = new CustomEvent(eventName, {
          bubbles: true,
          cancelable: false,
        });
      
        evt.clientX = event.clientX + boundingClientRect.left;
        evt.clientY = event.clientY + boundingClientRect.top;
        evt.pageX = event.pageX + boundingClientRect.left;
        evt.pageY = event.pageY + boundingClientRect.top;
        evt.screenX = event.screenX;
        evt.screenY = event.screenY;
        evt._originalTarget = event.target;
      
        window.dispatchEvent(evt);
      });
    });
  }
  
  async _getProvider() {
    const { interactive } = this.props;
    
    const state = store.getState();
  
    if (state.project.loadState !== LOADED) {
      throw new Error('Canvas#_getProvider() failed: Project is not loaded');
    }
    
    if (!state.project.data.graphQLEndpointURL) {
      return {
        ProviderComponent: Provider,
        providerProps: { store },
      };
    }
  
    const graphQLEndpointURL = state.project.data.proxyGraphQLEndpoint
      ? `${URL_GRAPHQL_PREFIX}/${state.project.data.name}`
      : state.project.data.graphQLEndpointURL;
  
    const networkInterface = createNetworkInterface({
      uri: graphQLEndpointURL,
      opts: {
        credentials: process.env.NODE_ENV === 'development'
          ? 'include'
          : 'same-origin',
      },
    });
  
    const auth = state.project.data.auth;
  
    if (auth) {
      if (auth.type === 'jwt') {
        const getTokenFn = interactive ? getToken : getTokenFromLS;
        applyJWTMiddleware(networkInterface, getTokenFn);
      }
    }
  
    const client = new ApolloClient({
      networkInterface,
      reduxRootSelector: state => state[APOLLO_STATE_KEY],
    });
    
    const apolloReducer = client.reducer();
    const apolloMiddleware = client.middleware();
    
    store.replaceReducer(createReducer({
      [APOLLO_STATE_KEY]: apolloReducer,
    }));
  
    injectApolloMiddleware(apolloMiddleware);
  
    if (interactive) {
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
    }
  
    return {
      ProviderComponent: ApolloProvider,
      providerProps: { client, store },
    };
  }
  
  async _canvasInit() {
    const { projectName, interactive, containerStyle } = this.props;
  
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
  
    await loadComponents(contentWindow, projectName);
    
    const containerNode = document.getElementById(CANVAS_CONTAINER_ID);
    const overlayNode = document.getElementById(CANVAS_OVERLAY_ID);
    
    containerNode.setAttribute('style', containerStyle);
    
    const { ProviderComponent, providerProps } = await this._getProvider();

    const renderPreviewPromise = new Promise(resolve => {
      ReactDOM.render(
        <ProviderComponent {...providerProps}>
          <DocumentContext window={contentWindow} document={document}>
            <Preview
              ref={this._savePreviewRef}
              interactive={interactive}
              onDropZoneSnap={this._handleSnap}
              onDropZoneUnsnap={this._handleUnsnap}
              onDropZoneShowDropMenu={this._handleShowDropMenu}
              onDropZoneHideDropMenu={this._handleHideDropMenu}
            />
          </DocumentContext>
        </ProviderComponent>,

        containerNode,
        () => void resolve(),
      );
    });

    const renderOverlayPromise = new Promise(resolve => {
      ReactDOM.render(
        <ProviderComponent {...providerProps}>
          <DocumentContext window={contentWindow} document={document}>
            <Overlay />
          </DocumentContext>
        </ProviderComponent>,

        overlayNode,
        () => void resolve(),
      );
    });

    await Promise.all([renderPreviewPromise, renderOverlayPromise]);
  
    this._initialized = true;
  }
  
  _canvasCleanup() {
    const { interactive } = this.props;
    
    if (!this._initialized) return;

    const state = store.getState();
    if (state.project.data.graphQLEndpointURL) {
      removeApolloMiddleware();
      store.replaceReducer(createReducer({
        [APOLLO_STATE_KEY]: returnNull,
      }));
    }
  
    const contentWindow = this._iframe.contentWindow;
    const document = contentWindow.document;
    const containerNode = document.getElementById(CANVAS_CONTAINER_ID);
    const overlayNode = document.getElementById(CANVAS_OVERLAY_ID);
  
    if (interactive) ReactDOM.unmountComponentAtNode(overlayNode);
    ReactDOM.unmountComponentAtNode(containerNode);
  
    this._initialized = false;
  }

  _handleDrag(data) {
    this._preview.drag(data);
  }

  _handleEnter() {
    this._preview.enter();
  }

  _handleLeave() {
    this._preview.leave();
  }
  
  _handleDropMenuItemSelected(data) {
    this._preview.dropMenuItemSelected(data);
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
  
  _handleShowDropMenu({ coords, dropPointsData }) {
    const { dropZoneId, onDropZoneShowDropMenu } = this.props;
    onDropZoneShowDropMenu({ dropZoneId, coords, dropPointsData });
  }
  
  _handleHideDropMenu() {
    const { dropZoneId, onDropZoneHideDropMenu } = this.props;
    onDropZoneHideDropMenu({ dropZoneId });
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
