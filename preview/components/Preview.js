import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import { Router, Route, applyRouterMiddleware, hashHistory } from 'react-router';
import { connect } from 'react-redux';

import { componentsMap } from '../utils';
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

let mapDispatchToEvents = function(dispatch) {
  return {
    updateSelected: function(selected) {
        dispatch(updatePreviewSelected(selected));
    }
  };
}

class Preview extends Component {
    constructor() {
        super();
    }

    componentDidMount() {
        if(this.props.canSelected) {
            this.domNode = ReactDOM.findDOMNode(this);
            this.domNode.addEventListener('click', this._hoistEvent.bind(this), false);

            window.addEventListener("resize", this._resizeEvent.bind(this), false);
        }
    }

    componentWillUnmount() {
        if(this.props.canSelected) {
            this.domNode.removeEventListener('click', this._hoistEvent.bind(this),
                false);
            window.removeEventListener("resize", this._resizeEvent.bind(this), false);
        }
    }

    _resizeEvent() {
        this._renderOverlayDOM();
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
    /**
     * Get array selected components
     * 
     * @param  {function} el
     * @param  {Object} params
     */
    _updateSelected(el, params) {
        const _owner = this._getOwner(el, (item) => {
            return item._currentElement.props.uid == params.uid;
        });

        const _domEl = _owner._renderedComponent._hostNode,
            _prevSelected = this.props.selected;

        let _nextSelected = [];

        if(_prevSelected.find((item) => item.uid == params.uid)) {
            _nextSelected = _prevSelected.filter((item) => item.uid != params.uid);
        } else {
            _nextSelected = _nextSelected.concat({
                el: _domEl,
                uid: params.uid
            }, _prevSelected);
        }

        this.props.updateSelected(_nextSelected);
    }

    _getSelected() {
        return this.props.selected;
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
                        const _params = componentsMap.get(
                            _owner._currentElement.props.uid);

                        if(e.type == 'click') {
                            this._updateSelected(_el, _params);
                            this._renderOverlayDOM();
                        } else {
                            commonUtils.hoistEventToConstructor('UnknownEvent', _params);
                        }

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

    _renderOverlayDOM() {
        const _selected = this._getSelected();

        ReactDOM.render(
            <Overlay selected={_selected}/>,
            document.getElementById('overlay')
        );
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
    routes: PropTypes.array,
    canSelected: PropTypes.bool
};

Preview.defaultProps = {
    routes: [],
    canSelected: false
};

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    selected: state.preview.selectedItems
});

export default connect(
    mapStateToProps,
    mapDispatchToEvents
)(Preview);
