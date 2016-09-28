'use strict';

//noinspection JSUnresolvedVariable
import React, { Component } from 'react';

import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';
import store from '../store';

export default class PreviewRoute extends Component {
    render() {
        return (
            <PreviewIFrame
                store={store}
                url={`/preview/${this.props.params.projectName}/index.html`}
            />
        );
    }
}
