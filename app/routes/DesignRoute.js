/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';

import { PreviewIFrame } from '../components/PreviewIFrame';
import store from '../store';

export default class DesignRoute extends Component {
    render() {
        const src = `/preview/${this.props.params.projectName}/index.html`;

        return (
            <PreviewIFrame
                externalStore={store}
                canSelected={true}
                previewAppURL={src}
            />
        );
    }
}
