'use strict';

import React, { Component } from 'react';

import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';
import store from '../store';

class PreviewRoute extends Component {
    render() {
        const _src = `/preview/${this.props.params.projectName}/index.html`;

        return (
            <PreviewIFrame
                externalStore={store}
                canSelected={false}
                canHighlight={false}
                previewAppURL={_src}
            />
        );
    }
}

export default PreviewRoute;