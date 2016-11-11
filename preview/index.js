'use strict';

import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { hashHistory } from 'react-router';

import Preview from './containers/Preview';
import Overlay from './containers/Overlay';

import {
    PREVIEW_DOM_CONTAINER_ID,
    PREVIEW_DOM_OVERLAY_ID
} from '../common/shared-constants';

window.JSSY = {
    initialized: false,
    params: null
};

/**
 * Rendering of preview
 *
 * @param {Object} params
 * @param {Object} params.store
 * @param {boolean} params.interactive
 * @param {string} params.containerStyle
 */

window.JSSY.initPreview = params => {
    if (window.JSSY.initialized)
        return { history: hashHistory };

    const containerNode = document.getElementById(PREVIEW_DOM_CONTAINER_ID),
        overlayNode = document.getElementById(PREVIEW_DOM_OVERLAY_ID);

    containerNode.setAttribute('style', params.containerStyle);

    ReactDOM.render(
        <Provider store={params.store}>
            <Preview interactive={params.interactive} />
        </Provider>,

        containerNode
    );

    if (params.interactive) {
        ReactDOM.render(
            <Provider store={params.store}>
                <Overlay />
            </Provider>,

            overlayNode
        );
    }

    window.JSSY.initialized = true;
    window.JSSY.params = params;

    return { history: hashHistory };
};

window.JSSY.cleanup = () => {
    const { params, initialized } = window.JSSY;

    if (!initialized) return;

    const containerNode = document.getElementById(PREVIEW_DOM_CONTAINER_ID),
        overlayNode = document.getElementById(PREVIEW_DOM_OVERLAY_ID);

    if (params.interactive)
        ReactDOM.unmountComponentAtNode(overlayNode);

    ReactDOM.unmountComponentAtNode(containerNode);

    window.JSSY.initialized = false;
    window.JSSY.params = null;
};
