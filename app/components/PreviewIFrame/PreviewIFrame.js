'use strict';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export class PreviewIFrame extends Component {
    componentDidMount() {
        const domNode = ReactDOM.findDOMNode(this),
            contentWindow = domNode.contentWindow,
            { store, canSelect } = this.props;

        contentWindow.addEventListener('DOMContentLoaded', () => {
            contentWindow.JSSY.initPreview({ store, canSelect });
        });
    }

    render() {
        return (
            <iframe src={this.props.url} />
        );
    }
}

PreviewIFrame.displayName = 'PreviewIFrame';

PreviewIFrame.propTypes = {
    url: PropTypes.string.isRequired,
    store: PropTypes.any,
    canSelect: PropTypes.bool
};

PreviewIFrame.defaultProps = {
    url: '',
    store: {},
    canSelect: false
};
