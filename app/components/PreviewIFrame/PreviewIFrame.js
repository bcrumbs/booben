import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export class PreviewIFrame extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const domNode = ReactDOM.findDOMNode(this);

        domNode.onload = () => {
            this.contentDocument = domNode.contentDocument;
            this.contentWindow = domNode.contentWindow;

            this.contentWindow.JSSY.setParams({
                store: this.props.externalStore,
                canSelected: this.props.canSelected
            });
        }
    }

    render() {
        return (
            <iframe src={this.props.previewAppURL} />
        );
    }
}

PreviewIFrame.displayName = 'PreviewIFrame';

PreviewIFrame.propTypes = {
    previewAppURL: PropTypes.string.isRequired,
    externalStore: PropTypes.any
};

PreviewIFrame.defaultProps = {
    previewAppURL: '',
    externalStore: {}
};
