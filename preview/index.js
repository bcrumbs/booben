import ReactDOM from 'react-dom';
import React from 'react';

import Preview from './Preview';
import project from './project';

/**
 * Rendering of preview
 * 
 * @return {}
 */
window.render = function(routes = []) {
    ReactDOM.render(
        <Preview routes={routes} />,
        document.getElementById('container')
    );
}

/**
 * Call for testing.
 */
window.render(project.routes);