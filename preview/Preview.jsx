import React, { Component, PropTypes } from 'react';
import { Route } from 'react-router';

import Container from './Container';
import { Builder } from './utils';

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

        return 
            <Route path="/" component={Container}>
                {_routes}
            </Route>
       ;
    }
}

Preview.propTypes = {
    data: PropTypes.array
};

Preview.defaultProps = {
    data: []
};

export default Preview;