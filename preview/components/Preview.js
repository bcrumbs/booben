'use strict';

import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { Router, Route, applyRouterMiddleware, hashHistory } from 'react-router';
import { connect } from 'react-redux';

import Builder from './Builder';
import Overlay from './Overlay';

import {
    updatePreviewSelected,
    updatePreviewHighlighted
} from '../../app/actions/preview'

/**
 * @param  {Array} data
 * @param  {Object} route
 * @param  {Array} routes
 * @return {Object}
 */
const getComponentsByRoute = (data, route, routes) => {
    let _data = data,
        component = null;

    routes.forEach(_route => {
        _data = _data.find(item => item.path == _route.path);

        if (_data.path == route.path)
            component = _data.component;

        _data = _data.children;
    });

    return component;
};

/**
 * Get owner React element by condition
 *
 * @param  {function} el
 * @param  {function} [condition]
 * @return {function}
 */
const getOwner = (el, condition) => {
    const owner = el._owner;
    if (!owner) return null;
    if (!condition) return owner;
    return condition(owner) ? owner : getOwner(owner, condition);
};

class Preview extends Component {
    constructor() {
        super();

        this.domNode = null;
        this.mouseEvents = ['click', 'mouseover', 'mouseout', 'dragover', 'dragleave',
            'drop'];

        this._handleMouseEvent = this._handleMouseEvent.bind(this);
        this._handleResize = this._handleResize.bind(this);
    }

    componentDidMount() {
        this.domNode = ReactDOM.findDOMNode(this);

        if (this.props.canSelect) {
            this.mouseEvents.forEach((e) => {
              this.domNode.addEventListener(e, this._handleMouseEvent, false);
            });

            window.addEventListener('resize', this._handleResize, false);
        }
    }

    componentWillUnmount() {
        if (this.props.canSelect) {
            this.mouseEvents.forEach((e) => {
              this.domNode.removeEventListener(e, this._handleMouseEvent, false);
            });

            window.removeEventListener('resize', this._handleResize, false);
        }

        this.domNode = null;
    }

    _handleResize() {
        this._renderOverlayDOM();
    }

    /**
     * Get array of selected components
     *
     * @param  {function} el
     * @param  {string} uid
     */
    _updateSelected(el, uid) {
        const owner = getOwner(el, item => item._currentElement.props.uid == uid),
            domEl = owner._renderedComponent._hostNode;

        let next = this.props.selected.filter(item => item.uid != uid);

        if (next.length === this.props.selected.length)
            next = next.concat({ uid, el: domEl });

        this.props.updateSelected(next);
    }

    /**
     * Get array of highlighted components
     *
     * @param  {function} el
     * @param  {string} uid
     */
    _updateHighlighted(el, uid) {
        const owner = getOwner(el, item => item._currentElement.props.uid == uid),
            domEl = owner._renderedComponent._hostNode;

        this.props.updateHighlighted([{ uid, el: domEl }]);
    }

    /**
     * 
     * @param {MouseEvent} event
     */
    _handleMouseEvent(event) {
        const keys = Object.keys(event.target),
            riiKey = keys.find(key => key.startsWith('__reactInternalInstance$'));

        if (!riiKey) return;

        const el = event.target[riiKey]._currentElement,
            owner = getOwner(el, item => item._currentElement.props.uid);

        if (owner) {
            switch(event.type) {
                case 'click':
                    if (!event.ctrlKey) return;
                    this._updateSelected(el, owner._currentElement.props.uid);
                    break;
                case 'dragover':
                case 'mouseover':
                    this._updateHighlighted(el, owner._currentElement.props.uid);
                    break;
                case 'dragleave':
                case 'mouseout':
                    this.props.updateHighlighted([]);
                    break;
            }

            this._renderOverlayDOM();
            event.stopPropagation();
        }
    }

    _getRoute(route) {
        if (route.children && route.children.length) {
            const childRoutes = route.children.map(child => this._getRoute(child));

            return (
                <Route path={route.path} component={Builder}>
                    {childRoutes}
                </Route>
            );
        } else {
            return <Route path={route.path} component={Builder} />;
        }
    }

    _getRouterMiddleware() {
        return {
            renderRouteComponent: (child, props) => {
                const data = getComponentsByRoute(
                    this.props.routes,
                    props.route,
                    props.routes
                );

                return data ? React.cloneElement(child, { data }) : child;
            }
        }
    }

    _renderOverlayDOM() {
        ReactDOM.render(
            <Overlay 
                selected={this.props.selected}
                highlighted={this.props.highlighted}
            />,

            document.getElementById('overlay')
        );
    }

    render() {
        const routes = this.props.routes.map(route => this._getRoute(route));

        return (
            <Router
                render={applyRouterMiddleware(this._getRouterMiddleware())}
                history={hashHistory}
            >
                {routes}
            </Router>
        );
    }
}

Preview.propTypes = {
    canSelect: PropTypes.bool,
    canHighlight: PropTypes.bool,
    routes: PropTypes.array,
    selected: PropTypes.array,
    highlighted: PropTypes.array,
    updateSelected: PropTypes.func,
    updateHighlighted: PropTypes.func
};

Preview.defaultProps = {
    canSelect: false,
    canHighlight: false,
    routes: [],
    selected: [],
    highlighted: [],
    updateSelected: /* istanbul ignore next */ () => {},
    updateHighlighted: /* istanbul ignore next */ () => {}
};

Preview.displayName = 'Preview';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    selected: state.preview.selectedItems,
    highlighted: state.preview.highlightedItems
});

const mapDispatchToProps = dispatch => ({
    updateSelected: selected => void dispatch(updatePreviewSelected(selected)),
    updateHighlighted: highlighted => void dispatch(updatePreviewHighlighted(
        highlighted))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
