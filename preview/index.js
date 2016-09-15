import ReactDOM from 'react-dom';
import React from 'react';

import App from './components/App';
import project from './project';

/**
 * Rendering of preview
 * 
 * @return {}
 */
window.renderProject = function(project) {
    ReactDOM.render(
        <App project={project} />,
        document.getElementById('container')
    );
}

/**
 * Call for testing.
 */
window.hoistEventToConstructor = function(eventName, params) {
    console.log(eventName, params);
}

window.renderProject(project);