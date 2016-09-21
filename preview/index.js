'use strict';

import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

import Preview from './components/Preview';

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
            <Preview canSelect={params.canSelect} canHighlight={params.canHighlight}/>
        </Provider>,

        document.getElementById('container')
    );
};
