import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { Router, Route, useRouterHistory, applyRouterMiddleware } from 'react-router';
import { createHashHistory } from 'history';

import Container from './Container';
import { Builder } from './utils';

let project = {
    name: 'Sample Project',
    author: 'iAuthor',
    componentLibs: ['@reactackle/reactackle'],
    relayEndpointURL: '',
    routes: [
        {
            path: "page1",
            children: [
                {
                    path: "sub",
                    children: [],
                    components: [
                        {
                            name: 'Datepicker',
                            props: {},
                            children: []
                        }
                    ]
                }
            ],
            components: [
                {
                    name: 'Radio',
                    props: {
                        source: 'static',
                        sourceData: {
                            SourceDataStatic: {
                                checked: true
                            }
                        }
                    },
                    children: []
                }
            ]
        },
        {
            path: "page2",
            children: [],
            components: [
                {
                    name: 'Datepicker',
                    props: {},
                    children: []
                }
            ]
        }
    ]
}

const browserHistory = useRouterHistory(createHashHistory)({
    queryKey: false,
    basename: '/dev/preview/'
});

const useBuilderProps = {
  renderRouteComponent: (child, props) => {
    const { key, route } = props;

    let _route = project.routes.find((item) => {
        return item.path == route.path;
    })

    if(_route) {
        return React.cloneElement(child, {
            data: _route.components
        });
    } else {
        return child;
    }
  }
}

class Preview extends Component {
    getRoute(route, routerState) {
        if(route.children) {
            return <Route path={route.path} component={Builder}>
                {route.children.map((_route) => {
                    return this.getRoute(_route);
                })}
            </Route>;
        } else {
            return <Route path={route.path} component={Builder} />;
        }
    }

    render() {
        let _routes = [];

        _routes = this.props.data.map((route) => {
            return this.getRoute(route);
        })

        return <Router render={applyRouterMiddleware(useBuilderProps)} history={browserHistory}>
            <Route path="/" component={Container}>
                {_routes}
            </Route>
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