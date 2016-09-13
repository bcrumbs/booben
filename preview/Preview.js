import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { Router, Route, applyRouterMiddleware, hashHistory } from 'react-router';

import { Builder, componentsMap } from './utils';

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

        this.domNode.addEventListener("click", this._hoistingEvent.bind(this), false);
    }

    componentWillUnmount() {
        this.domNode.removeEventListener("click", this._hoistingEvent.bind(this), false);
    }

    /**
     * Get owner React element by condition
     * 
     * @param  {function} el
     * @param  {function} condition
     * @return {function}
     */
    _getOwner(el, condition) {
        const _el = el._owner._currentElement;

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

    /**
     * Hoisting preview event to constructor
     * 
     * @param  {MouseEvent} e
     */
    _hoistingEvent(e) {
        if(e.ctrlKey) {
            for (var key in e.target) {
                if (key.startsWith("__reactInternalInstance$")) {

                    const _owner = this._getOwner(e.target[key]._currentElement, (item) => {
                        return item.props.uid;
                    })

                    window.hoistingEventToConstructor(e.type, componentsMap.get(_owner.props.uid));
                }
            }
        }
    }

    getRoute(route) {
        if(route.children && route.children.length) {
            return <Route path={route.path} component={Builder}>
                {route.children.map((_route) => {
                    return this.getRoute(_route);
                })}
            </Route>;
        } else {
            return <Route path={route.path} component={Builder} />;
        }
    }

    getRouterMiddleware() {
        return {
            renderRouteComponent: (child, props) => {
                const { key, route, routes } = props,
                      _component = getComponentsByRoute(this.props.routes, route, routes);

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
            return this.getRoute(route);
        })

        return <Router render={applyRouterMiddleware(this.getRouterMiddleware())} history={hashHistory}>
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