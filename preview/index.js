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
 * @param {boolean} params.interactive
 */

window.JSSY.initPreview = params => {
    let domOverlay = ReactDOM.render(
        <Provider store={params.store}>
            <Overlay />
        </Provider>,

        document.getElementById('overlay')
    );

    ReactDOM.render(
        <Provider store={params.store}>
            <Preview
                interactive={params.interactive}
                overlayDomNode={ReactDOM.findDOMNode(domOverlay)}
            />
        </Provider>,

        document.getElementById('container')
    );

    return { history: hashHistory };
};
