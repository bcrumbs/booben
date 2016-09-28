'use strict';

import './PreviewIFrame.scss';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';

export class PreviewIFrame extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            history: null
        };

        this._iframe = null;
        this._nextPath = null;
    }

    componentDidMount() {
        const contentWindow = this._iframe.contentWindow,
            { store, interactive } = this.props;

        contentWindow.addEventListener('DOMContentLoaded', () => {
            if (contentWindow.JSSY) {
                const { history } = contentWindow.JSSY.initPreview({
                    store,
                    interactive
                });

                this.setState({
                    loaded: true,
                    history
                });

                if (this._nextPath !== null) {
                    history.push(this._nextPath);
                    this._nextPath = null;
                }
            }
            else {
                // TODO: Show warning?
                this.setState({ loaded: true });
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.path !== this.props.path) {
            if (this.state.loaded) {
                if (this.state.history) this.state.history.push(nextProps.path);
            }
            else {
                this._nextPath = nextProps.path;
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.url !== this.props.url;
    }

    render() {
        // TODO: Render preloader if this.state.loaded === false

        return (
        	<section className="preview-iframe-wrapper">
                <iframe
                    ref={iframe => this._iframe = iframe}
                    src={`${this.props.url}#${this.props.path}`}
                    className="preview-iframe"
                />
	        </section>
        );
    }
}

PreviewIFrame.displayName = 'PreviewIFrame';

PreviewIFrame.propTypes = {
    url: PropTypes.string.isRequired,
    path: PropTypes.string,
    store: PropTypes.any,
    interactive: PropTypes.bool
};

PreviewIFrame.defaultProps = {
    url: '',
    path: '/',
    store: {},
    interactive: false
};
