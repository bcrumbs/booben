'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent } from 'react';

import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';
import store from '../store';

export default class PreviewRoute extends PureComponent {
    render() {
        return (
            <PreviewIFrame
                store={store}
                url={`/preview/${this.props.params.projectName}/index.html`}
            />
        );
    }
}
