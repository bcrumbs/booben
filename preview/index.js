import ReactDOM from 'react-dom';
import React from 'react';

import Container from './Container';
import { builder } from './utils';

let _metaData = {
    name: 'root',
    type: 'Datepicker',
    props: {},
    children: []
}

/**
 * Render view by data from meta file
 * @return {}
 */
window.render = function(metaData = {}) {
    ReactDOM.render(
        <Container>
            { builder.getComponentFromMeta(metaData) }
        </Container>,
        document.getElementById('container')
    );
}

/**
 * Call for testing.
 */
window.render(_metaData);