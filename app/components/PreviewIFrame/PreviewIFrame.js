import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export class PreviewIFrame extends Component {
    constructor(props) {
        super(props);

        this._handlePreviewEvent = this._handlePreviewEvent.bind(this);
    }

    componentDidMount() {
        const domNode = ReactDOM.findDOMNode(this);

        domNode.onload = () => {
            this.contentDocument = domNode.contentDocument;
            this.contentWindow = domNode.contentWindow;
            this.contentWindow.hoistEventToConstructor = this._handlePreviewEvent;
            this.contentWindow.renderProject(this.props.project);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.project !== this.props.project)
            this.contentWindow.renderProject(nextProps.project);
    }

    /**
     * Handle event from the preview app
     * 
     * @param {string} event - event name
     * @param {*} [params] - event params
     */
    _handlePreviewEvent(event, params) {
        console.log(event, params);
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
    project: PropTypes.object.isRequired,
    path: PropTypes.string
};

PreviewIFrame.defaultProps = {
    previewAppURL: '',
    project: {},
    path: '/'
};
