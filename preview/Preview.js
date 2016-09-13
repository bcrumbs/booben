import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { Router, Route, applyRouterMiddleware, hashHistory } from 'react-router';

import { Builder, componentsMap, getCoords } from './utils';
import Overlay from './Overlay';

/**
 * @param  {Array} data
 * @param  {Object} route
 * @param  {Array} routes
 * @return {Object}
 */
const getComponentsByRoute = (data, route, routes) => {
    let _data = data,
        _component = null;

    routes.forEach((_route) => {
        _data = _data.find((_item) => {
            return _item.path == _route.path;
        });

        if(_data.path == route.path) {
            _component = _data.component;
        }

        _data = _data.children;
    });

    return _component;
}

class Preview extends Component {
    componentDidMount() {
        this.domNode = ReactDOM.findDOMNode(this);
        this.domNode.addEventListener('click', this._hoistEvent.bind(this), false);
    }

    componentWillUnmount() {
        this.domNode.removeEventListener('click', this._hoistEvent.bind(this),
            false);
    }

    /**
     * Get owner React element by condition
     * 
     * @param  {function} el
     * @param  {function} condition
     * @return {function}
     */
    _getOwner(el, condition) {
        if(el._owner) {
            const _el = el._owner;

            if(condition) {
                if(condition(_el)) {
                    return _el;
                } else {
                    return this._getOwner(_el, condition);
                }
            } else {
                return _el;
            }
        }

        return null;
    }

    _getSelected(el) {
        const _owner = this._getOwner(el, (item) => {
            return item._currentElement.props.uid;
        });

        const _domEl = _owner._renderedComponent._hostNode;

        return [_domEl.getBoundingClientRect()];
    }

    /**
     * Hoist preview event to constructor
     * 
     * @param  {MouseEvent} e
     */
    _hoistEvent(e) {
        if(e.ctrlKey) {
            for (var key in e.target) {
                if (key.startsWith('__reactInternalInstance$')) {
                    let _el = e.target[key]._currentElement;

                    const _owner = this._getOwner(_el, (item) => {
                        return item._currentElement.props.uid;
                    });

                    if(_owner) {
                        let _eventName = 'UnknownEvent';

                        if(e.type == 'click') {
                            _eventName = 'SelectСomponent';

                            this._getSelected(_el);
                        }

                        const _params = componentsMap.get(
                            _owner._currentElement.props.uid);

                        window.hoistEventToConstructor(_eventName, _params);
                        e.stopPropagation();
                    }
                }
            }
        }
    }

    _getRoute(route) {
        if(route.children && route.children.length) {
            return <Route path={route.path} component={Builder}>
                {route.children.map((_route) => {
                    return this._getRoute(_route);
                })}
            </Route>;
        } else {
            return <Route path={route.path} component={Builder} />;
        }
    }

    _getRouterMiddleware() {
        return {
            renderRouteComponent: (child, props) => {
                const { key, route, routes } = props,
                      _component = getComponentsByRoute(this.props.routes, route,
                        routes);

                if(_component) {
                    return React.cloneElement(child, {
                        data: _component
                    });
                } else {
                    return child;
                }
            }
        }
    }

    render() {
        const _routes = this.props.routes.map((route) => {
            return this._getRoute(route);
        })

        return <Router
            render={applyRouterMiddleware(this._getRouterMiddleware())}
            history={hashHistory}>
            {_routes}
        </Router>;
    }
}

Preview.propTypes = {
    routes: PropTypes.array
};

Preview.defaultProps = {
    routes: []
};

export default Preview;