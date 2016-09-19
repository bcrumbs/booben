'use strict';

import React, { Component } from 'react';

import { PreviewIFrame } from '../components/PreviewIFrame';
import store from '../store';

class PreviewRoute extends Component {
    render() {
        const src = `/preview/${this.props.params.projectName}/index.html`;
        const srcDev = '/dev/preview/';

        return (
            <PreviewIFrame
                externalStore={store}
                canSelected={true}
                previewAppURL={srcDev}
            />
        );
    }
}

export default PreviewRoute;