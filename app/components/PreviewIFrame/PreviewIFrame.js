'use strict';

import './PreviewIFrame.scss';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';

import store from '../../store';

import { setIsIndexRoute } from '../../actions/preview';

const EVENTS_FOR_PARENT_FRAME = [
    'mousemove',
    'mouseup',
    'mousedown',
    'mouseover',
    'mouseout'
];

export class PreviewIFrame extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            history: null
        };

        this._iframe = null;
        this._nextPath = null;
        this._nextIsIndexRoute = null;

        this._saveIFrameRef = this._saveIFrameRef.bind(this);
    }

    componentDidMount() {
        const contentWindow = this._iframe.contentWindow,
            { store, interactive } = this.props;

        EVENTS_FOR_PARENT_FRAME.forEach(eventName => {
            contentWindow.addEventListener(eventName, event => {
                const boundingClientRect = this._iframe.getBoundingClientRect();

                const evt = new CustomEvent(eventName, {
                    bubbles: true,
                    cancelable: false
                });

                evt.clientX = event.clientX + boundingClientRect.left;
                evt.clientY = event.clientY + boundingClientRect.top;
                evt.pageX = event.pageX + boundingClientRect.left;
                evt.pageY = event.pageY + boundingClientRect.top;
                evt._originalTarget = event.target;

                this._iframe.dispatchEvent(evt);
            });
        });

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
                    this._goTo(this._nextPath, this._nextIsIndexRoute);
                    this._nextPath = null;
                    this._nextIsIndexRoute = null;
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
                this._goTo(nextProps.path, nextProps.isIndexRoute);
            }
            else {
                this._nextPath = nextProps.path;
                this._nextIsIndexRoute = nextProps.isIndexRoute;
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.url !== this.props.url;
    }

    _saveIFrameRef(ref) {
        this._iframe = ref;
    }

    _goTo(path, isIndexRoute) {
        if (this.state.history) {
            this.state.history.push(path);
            store.dispatch(setIsIndexRoute(isIndexRoute));
        }
    }

    render() {
        // TODO: Render preloader if this.state.loaded === false

        return (
        	<section className="preview-iframe-wrapper">
                <iframe
                    ref={this._saveIFrameRef}
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
    interactive: PropTypes.bool,
    isIndexRoute: PropTypes.bool
};

PreviewIFrame.defaultProps = {
    url: '',
    path: '/',
    store: {},
    interactive: false,
    isIndexRoute: false
};
