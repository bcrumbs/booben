import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

class ProxyIFrame extends Component {
    constructor(props) {
        super(props);
        this.displayName = 'ProxyIFrame';
    }

    componentDidMount() {
        const domNode = ReactDOM.findDOMNode(this);

        domNode.onload = (() => {
            this.contentDocument = domNode.contentDocument;
            this.contentWindow = domNode.contentWindow;

            this.contentWindow.hoistingEventToConstructor = this._hoistingEventToConstructor;
        })
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.data) this.contentWindow && this.contentWindow.render(nextProps.data);
    }

    /**
     * Hoisting event from the internal content iframe
     * 
     * @param  {[type]} e - event
     * @return {}
     */
    _hoistingEventToConstructor(e) {
        e.stopPropagation();
    }

    render() {
        return (
            <iframe {...this.props.iframeProps} />
        );
    }
}

ProxyIFrame.propTypes = {
    iframeProps: PropTypes.object,
    data: PropTypes.object
};

ProxyIFrame.defaultProps = {
    iframeProps: {
        frameBorder: 1,
        src: ''
    },
    data: {}
};

export default ProxyIFrame;