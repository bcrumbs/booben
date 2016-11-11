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
 */

window.JSSY.initPreview = params => {
    if (window.JSSY.initialized)
        return { history: hashHistory };

    ReactDOM.render(
        <Provider store={params.store}>
            <Preview interactive={params.interactive} />
        </Provider>,

        document.getElementById(PREVIEW_DOM_CONTAINER_ID)
    );

    if (params.interactive) {
        ReactDOM.render(
            <Provider store={params.store}>
                <Overlay />
            </Provider>,

            document.getElementById(PREVIEW_DOM_OVERLAY_ID)
        );
    }

    window.JSSY.initialized = true;
    window.JSSY.params = params;

    return { history: hashHistory };
};

window.JSSY.cleanup = () => {
    const { params, initialized } = window.JSSY;

    if (!initialized) return;

    if (params.interactive)
        ReactDOM.unmountComponentAtNode(document.getElementById(PREVIEW_DOM_OVERLAY_ID));

    ReactDOM.unmountComponentAtNode(document.getElementById(PREVIEW_DOM_CONTAINER_ID));

    window.JSSY.initialized = false;
    window.JSSY.params = null;
};
