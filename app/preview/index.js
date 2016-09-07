import ReactDOM from 'react-dom';
import React from 'react';

import Container from './Container';
import { Builder } from './utils';

/**
 * Render view by data from meta file
 * @return {}
 */
window.render = function() {
    ReactDOM.render(
        <Container>
            { Builder.getComponentByProject() }
        </Container>,
        document.getElementById('container')
    );
}

/**
 * Call for testing.
 */
window.render();