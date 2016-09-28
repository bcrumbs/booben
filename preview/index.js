'use strict';

import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { hashHistory } from 'react-router';

import Preview from './components/Preview';
import Overlay from './components/Overlay';

window.JSSY = {};

/**
 * Rendering of preview
 *
 * @param {Object} params
 * @param {Object} params.store
 * @param {boolean} params.canSelect
 */

window.JSSY.initPreview = params => {
    ReactDOM.render(
        <Provider store={params.store}>
            <Preview canSelect={params.canSelect} />
        </Provider>,

        document.getElementById('container')
    );

    ReactDOM.render(
        <Provider store={params.store}>
            <Overlay />
        </Provider>,

        document.getElementById('overlay')
    );

    return { history: hashHistory };
};
