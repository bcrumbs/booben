import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

import Preview from './components/Preview';

window.JSSY = {};

/**
 * Rendering of preview
 * 
 * @return {}
 */

window.JSSY.setParams = function(params) {
    ReactDOM.render(
        <Provider store={params.store}>
            <Preview canSelected={params.canSelected} />
        </Provider>,
        document.getElementById('container')
    );
}

/**
 * Call for testing.
 */
window.hoistEventToConstructor = function(eventName, params) {
    console.log(eventName, params);
}