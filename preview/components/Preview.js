'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Set } from 'immutable';

import Builder from './Builder';
import Overlay from './Overlay';

import { domElementsMap } from '../utils';

import {
    selectPreviewComponent,
    deselectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent
} from '../../app/actions/preview'

import { 
    ProjectRoute
} from '../../app/models';

const createBuilder = component =>
    ({ children }) => <Builder component={component} children={children} />;

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
    constructor(props) {
        super(props);

        this.domNode = null;

        this.mouseEvents = [
            'click', 'mouseover', 'mouseout', 'dragover', 'dragleave','drop',
            'mousedown'
        ];

        this._handleMouseEvent = this._handleMouseEvent.bind(this);
        this._handleResize = this._handleResize.bind(this);
    }

    componentDidMount() {
        this.domNode = ReactDOM.findDOMNode(this);

        if (this.props.canSelect) {
            this.mouseEvents.forEach(e => {
                this.domNode.addEventListener(e, this._handleMouseEvent, false);
            });

            window.addEventListener('resize', this._handleResize, false);
        }
    }

    componentWillUnmount() {
        if (this.props.canSelect) {
            this.mouseEvents.forEach(e => {
                this.domNode.removeEventListener(e, this._handleMouseEvent, false);
            });

            window.removeEventListener('resize', this._handleResize, false);
        }

        this.domNode = null;
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.routes !== this.props.routes;
    }

    _handleResize() {
        this._renderOverlay();
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

        domElementsMap.set(uid, domEl);

        if(this.props.selected.has(uid)) {
            this.props.deselectComponent(uid);
        } else {
            this.props.selectComponent(uid)
        }
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

        domElementsMap.set(uid, domEl);

        if(this.props.highlighted.has(uid)) {
            this.props.unhighlightComponent(uid);
        } else {
            this.props.highlightComponent(uid);
        }
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
            event.preventDefault();
            event.stopPropagation();

            const type = event.type;

            if( type == 'click' ) {
                if(!event.ctrlKey) return;
                this._updateSelected(el, owner._currentElement.props.uid);
            } else if( type == 'dragover' || type == 'mouseover') {
                this._updateHighlighted(el, owner._currentElement.props.uid);
            } else if( type == 'dragleave' || type == 'mouseout') {
                this._updateHighlighted(el, owner._currentElement.props.uid);
            } else if( type == 'drop' ) {
                console.log({
                    source: JSON.parse(event.dataTransfer.getData("Text")),
                    target: owner._currentElement.props.uid
                });
            }

            if( type == 'mousedown' ) {
                if (event.which != 1) return;
            }

            this._renderOverlay();
        }
    }

    _renderOverlay() {
        ReactDOM.render(
            <Overlay 
                selected={this.props.selected}
                highlighted={this.props.highlighted}
            />,

            document.getElementById('overlay')
        );
    }

    _createRoute(route) {
        if (route.children && route.children.size) {
            return {
                path: route.path,
                component: createBuilder(route.component),
                childRoutes: route.children
                    .map(child => this._createRoute(child))
                    .toArray()
            };
        }
        else {
            return {
                path: route.path,
                component: createBuilder(route.component)
            };
        }
    }

    render() {
        const routes = this.props.routes
            .map(route => this._createRoute(route))
            .toArray();

        return (
            <Router history={hashHistory} routes={routes} />
        );
    }
}

Preview.propTypes = {
    canSelect: PropTypes.bool,
    canHighlight: PropTypes.bool,
    routes: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(ProjectRoute)
    ),
    selected: ImmutablePropTypes.set,
    highlighted: ImmutablePropTypes.set,
    deselectComponent: PropTypes.func,
    selectComponent: PropTypes.func,
    unhighlightComponent: PropTypes.func,
    highlightComponent: PropTypes.func
};

Preview.defaultProps = {
    canSelect: false,
    canHighlight: false,
    routes: List(),
    selected: Set(),
    highlighted: Set(),
    deselectComponent: /* istanbul ignore next */ () => {},
    selectComponent: /* istanbul ignore next */ () => {},
    highlightComponent: /* istanbul ignore next */ () => {},
    unhighlightComponent: /* istanbul ignore next */ () => {}
};

Preview.displayName = 'Preview';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    selected: state.preview.selectedItems,
    highlighted: state.preview.highlightedItems
});

const mapDispatchToProps = dispatch => ({
    deselectComponent: selected => void dispatch(deselectPreviewComponent(selected)),
    selectComponent: selected => void dispatch(selectPreviewComponent(selected)),
    highlightComponent: highlighted => void dispatch(highlightPreviewComponent(highlighted)),
    unhighlightComponent: highlighted => void dispatch(unhighlightPreviewComponent(highlighted))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
