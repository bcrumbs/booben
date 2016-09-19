import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

import App from './components/App';

window.JSSY = {};

/**
 * Rendering of preview
 * 
 * @return {}
 */

window.JSSY.setParams = function(params) {
    ReactDOM.render(
        <Provider store={params.store}>
            <App canSelected={params.canSelected}/>
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