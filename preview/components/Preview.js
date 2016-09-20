'use strict';

import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { Router, Route, applyRouterMiddleware, hashHistory } from 'react-router';
import { connect } from 'react-redux';

import Builder from './Builder';
import Overlay from './Overlay';

import { updatePreviewSelected } from '../../app/actions/preview'

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

        this._handleClick = this._handleClick.bind(this);
        this._handleResize = this._handleResize.bind(this);
    }

    componentDidMount() {
        this.domNode = ReactDOM.findDOMNode(this);

        if (this.props.canSelect) {
            this.domNode.addEventListener('click', this._handleClick, false);
            window.addEventListener('resize', this._handleResize, false);
        }
    }

    componentWillUnmount() {
        if (this.props.canSelect) {
            this.domNode.removeEventListener('click', this._handleClick, false);
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

        let nextSelected = this.props.selected.filter(item => item.uid != uid);

        if (nextSelected.length === this.props.selected.length)
            nextSelected = nextSelected.concat({ uid, el: domEl });

        this.props.updateSelected(nextSelected);
    }

    /**
     * 
     * @param {MouseEvent} event
     */
    _handleClick(event) {
        if (!event.ctrlKey) return;

        const keys = Object.keys(event.target),
            riiKey = keys.find(key => key.startsWith('__reactInternalInstance$'));

        if (!riiKey) return;

        const el = event.target[riiKey]._currentElement,
            owner = getOwner(el, item => item._currentElement.props.uid);

        if (owner) {
            this._updateSelected(el, owner._currentElement.props.uid);
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
            <Overlay selected={this.props.selected}/>,
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
    routes: PropTypes.array,
    selected: PropTypes.array,
    updateSelected: PropTypes.func
};

Preview.defaultProps = {
    canSelect: false,
    routes: [],
    selected: [],
    updateSelected: /* istanbul ignore next */ () => {}
};

Preview.displayName = 'Preview';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    selected: state.preview.selectedItems
});

const mapDispatchToProps = dispatch => ({
    updateSelected: selected => void dispatch(updatePreviewSelected(selected))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
