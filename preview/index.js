'use strict';

import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { hashHistory } from 'react-router';

import Preview from './components/Preview';
import Overlay from './components/Overlay';

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

        document.getElementById('container')
    );

    if (params.interactive) {
        ReactDOM.render(
            <Provider store={params.store}>
                <Overlay />
            </Provider>,

            document.getElementById('overlay')
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
        ReactDOM.unmountComponentAtNode(document.getElementById('overlay'));

    ReactDOM.unmountComponentAtNode(document.getElementById('container'));

    window.JSSY.initialized = false;
    window.JSSY.params = null;
};
