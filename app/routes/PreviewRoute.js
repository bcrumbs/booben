'use strict';

import React, { Component } from 'react';

import { PreviewIFrame } from '../components/PreviewIFrame';
import store from '../store';

class PreviewRoute extends Component {
    render() {
        const src = `/preview/${this.props.params.projectName}/index.html`;

        return (
            <PreviewIFrame externalStore={store} previewAppURL={src} />
        );
    }
}

export default PreviewRoute;