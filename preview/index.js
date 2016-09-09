import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { Router, Route, useRouterHistory, applyRouterMiddleware } from 'react-router';
import { createHashHistory } from 'history';

import Container from './Container';
import { Builder } from './utils';

import project from './project';

const browserHistory = useRouterHistory(createHashHistory)({
    queryKey: false,
    basename: '/dev/preview/'
});

/**
 * @param  {Array} data
 * @param  {Object} route
 * @param  {Array} routes
 * @return {Object}
 */
const getComponentsByRoute = (data, route, routes) => {
    let _data = data,
        _components = null;

    routes.forEach((_route) => {
        _data = _data.find((_item) => {
            return _item.path == _route.path;
        });

        if(_data.path == route.path) {
            _components = _data.components;

        }

        _data = _data.children;
    });

    return _components;
}

class Preview extends Component {
    getRoute(route, routerState) {
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
                      _components = getComponentsByRoute(this.props.data, route, routes);

                if(_components) {
                    return React.cloneElement(child, {
                        data: _components
                    });
                } else {
                    return child;
                }
            }
        }
    }

    render() {
        const _routes = this.props.data.map((route) => {
            return this.getRoute(route);
        })

        return <Router render={applyRouterMiddleware(this.getRouterMiddleware())} history={browserHistory}>
            {_routes}
        </Router>;
    }
}

Preview.propTypes = {
    data: PropTypes.array
};

Preview.defaultProps = {
    data: []
};

/**
 * Rendering of preview
 * 
 * @return {}
 */
window.render = function(metaData = []) {
    ReactDOM.render(
        <Preview data={metaData} />,
        document.getElementById('container')
    );
}

/**
 * Call for testing.
 */
window.render(project.routes);