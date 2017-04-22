'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import _set from 'lodash.set';
import _get from 'lodash.get';
import { CanvasFrame } from '../../components/CanvasFrame/CanvasFrame';
import { DocumentContext } from './DocumentContext/DocumentContext';
import { loadComponents } from './content/componentsLibrary';
import Preview from './content/containers/Preview';
import Overlay from './content/containers/Overlay';
import { URL_GRAPHQL_PREFIX } from '../../../../shared/constants';
import { LOADED } from '../../constants/loadStates';
import { CANVAS_CONTAINER_ID, CANVAS_OVERLAY_ID } from './content/constants';
import { buildMutation } from '../../utils/graphql';
import { waitFor } from '../../utils/misc';
import contentTemplate from './content/content.ejs';

/* eslint-disable react/no-unused-prop-types */
const propTypes = {
  projectName: PropTypes.string.isRequired,
  store: PropTypes.any,
  interactive: PropTypes.bool,
  containerStyle: PropTypes.string,
};
/* eslint-enable react/no-unused-prop-types */

const defaultProps = {
  store: {},
  interactive: false,
  containerStyle: '',
};

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

export class Canvas extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._iframe = null;
    this._initialized = false;
    
    this.state = {
      error: null,
    };
    
    this._saveIFrameRef = this._saveIFrameRef.bind(this);
  }
  
  componentDidMount() {
    const contentWindow = this._iframe.contentWindow;
    
    // These modules are external in the components bundle
    contentWindow.React = React;
    contentWindow.ReactDOM = ReactDOM;
    contentWindow.PropTypes = PropTypes;
  
    this._canvasInit()
      .then(() => {
        this._attachEventListeners();
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
  }
  
  _saveIFrameRef(ref) {
    this._iframe = ref;
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
      
        this._iframe.dispatchEvent(evt);
      });
    });
  }
  
  async _getProvider() {
    const { store, interactive } = this.props;
    
    const state = store.getState();
  
    if (state.project.loadState !== LOADED)
      throw new Error('Canvas#_getProvider() failed: Project is not loaded');
    
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
  
    const client = new ApolloClient({ networkInterface });
  
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
    
    ReactDOM.render(
      <ProviderComponent {...providerProps}>
        <DocumentContext window={contentWindow} document={document}>
          <Preview interactive={interactive} />
        </DocumentContext>
      </ProviderComponent>,
      
      containerNode,
    );
    
    if (interactive) {
      ReactDOM.render(
        <ProviderComponent {...providerProps}>
          <DocumentContext window={contentWindow} document={document}>
            <Overlay />
          </DocumentContext>
        </ProviderComponent>,
        
        overlayNode,
      );
    }
  
    this._initialized = true;
  }
  
  _canvasCleanup() {
    const { interactive } = this.props;
    
    if (!this._initialized) return;
  
    const contentWindow = this._iframe.contentWindow;
    const document = contentWindow.document;
    const containerNode = document.getElementById(CANVAS_CONTAINER_ID);
    const overlayNode = document.getElementById(CANVAS_OVERLAY_ID);
  
    if (interactive) ReactDOM.unmountComponentAtNode(overlayNode);
    ReactDOM.unmountComponentAtNode(containerNode);
  
    this._initialized = false;
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

Canvas.propTypes = propTypes;
Canvas.defaultProps = defaultProps;
Canvas.displayName = 'Canvas';
