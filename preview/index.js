import ReactDOM from 'react-dom';
import React from 'react';

import Preview from './Preview';
import project from './project';

/**
 * Rendering of preview
 * 
 * @return {}
 */
window.renderProject = function(project) {
    ReactDOM.render(
        <Preview routes={project.routes} />,
        document.getElementById('container')
    );
}

/**
 * Call for testing.
 */
window.renderProject(project.routes);