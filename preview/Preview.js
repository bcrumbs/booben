import React, { Component, PropTypes } from 'react';
import { Router, Route, applyRouterMiddleware, hashHistory } from 'react-router';

import { Builder } from './utils';

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