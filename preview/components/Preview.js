'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Set } from 'immutable';

import Builder from './Builder';

import { domElementsMap, componentsMap } from '../utils';
import { getRoutePrefix } from '../../app/utils';

import {
    selectPreviewComponent,
    deselectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    setPreviewWorkspace,
    unsetPreviewWorkspace,
    showPreviewWorkspace,
    hidePreviewWorkspace
} from '../../app/actions/preview';

import {
    componentUpdateRoute
} from '../../app/actions/project';

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

/**
 * Get child React element by condition
 *
 * @param  {function} el
 * @param  {function} [condition]
 * @return {function}
 */
const getChild = (el, condition) => {
    let child = null;

    if(el._renderedComponent) {
        child = el._renderedComponent;
        if (!child) return null;
        if (!condition) return child;
        return condition(child) ? child : getChild(child, condition);
    } else if(el._renderedChildren) {
        for(let key in el._renderedChildren) {
            if(condition(el._renderedChildren[key])) {
                return el._renderedChildren[key];
            } else {
                child = getChild(el._renderedChildren[key], condition);

                if(child) return child;
            }
        }

        return null;
    }
};

const mouseEvents = [
    'click',
    'mouseover',
    'mouseout',
    'dragover',
    'dragleave',
    'drop',
    'mousedown'
];

class Preview extends Component {
    constructor(props) {
        super(props);

        this.domNode = null;
        this.domOverlay = null;
        this.dndParams = {};
        this.dndFlag = false;
        this.workspace = null;

        this._handleMouseEvent = this._handleMouseEvent.bind(this);
        this._handleResize = this._handleResize.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleStartDrag = this._handleStartDrag.bind(this);
        this._handleStopDrag = this._handleStopDrag.bind(this);
        this._handleAnimationFrame = this._handleAnimationFrame.bind(this);
    }

    componentDidMount() {
        this.domNode = ReactDOM.findDOMNode(this);
        this.domOverlay = this.props.domOverlay;
        this.animationFrame = null;
        this.needRAF = true;

        if (this.props.interactive) {
            mouseEvents.forEach(e => {
                this.domNode.addEventListener(e, this._handleMouseEvent, false);
            });

            window.addEventListener('resize', this._handleResize, false);

            this._updateWorkspace();
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.path != this.props.path) {
            this._updateWorkspace();
        }
    }

    componentWillMount() {
        this.routes = this.props.routes
            .map((route, routeIndex) => this._createRoute(route, routeIndex, route.path))
            .toArray();
    }

    componentWillUnmount() {
        if (this.props.interactive) {
            mouseEvents.forEach(e => {
                this.domNode.removeEventListener(e, this._handleMouseEvent, false);
            });

            window.removeEventListener('resize', this._handleResize, false);
        }

        this.domNode = null;
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.routes !== this.props.routes;
    }

    _updateWorkspace() {
        const builderWS = getChild(this['_reactInternalInstance'],
                item => item._currentElement.props.path == this.props.path);

        if(!builderWS)  return;

        this.workspace = builderWS._renderedComponent._currentElement.props.uid;
        this.props.setWorkspace(this.workspace);

        domElementsMap.set(this.workspace, builderWS._renderedComponent._hostNode);
    }

    _handleResize() {}

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

    _handleAnimationFrame() {
        var el = this.dndParams.el;

        el.style.transform = `translate(${this.dndParams.pageX}px,
            ${this.dndParams.pageY}px)`;
        this.animationFrame = null;
        this.needRAF = true;
    }

    _handleStartDrag(event) {
        if(this.dndFlag) return;

        this.domNode.addEventListener('mousemove', this._handleDrag);
        this.domNode.addEventListener('mouseup', this._handleStopDrag);
        window.top.addEventListener('mouseup', this._handleStopDrag);

        this.props.showWorkspace();
    }

    _handleStopDrag(event) {
        this.domNode.removeEventListener('mousemove', this._handleDrag);
        this.domNode.removeEventListener('mouseup', this._handleStopDrag);
        window.top.removeEventListener('mouseup', this._handleStopDrag);

        this.props.hideWorkspace();

        if(!this.dndFlag) return;

        const keys = Object.keys(event.target),
            riiKey = keys.find(key => key.startsWith('__reactInternalInstance$'));

        this.dndFlag = false;

        if (riiKey && this.dndParams) {
            const owner = getOwner(event.target[riiKey]._currentElement, item => item._currentElement.props.uid);

            if(owner && owner._currentElement.props.uid) {
                this.props.componentUpdateRoute(
                    this.dndParams.where,
                    owner._currentElement.props.where
                );
            }
        }

        if (this.animationFrame !== null) {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.domOverlay.removeChild(this.dndParams.el);
    }

    _handleDrag(event) {
        const moveX = event.pageX - this.dndParams.dragStartX,
            moveY = event.pageY - this.dndParams.dragStartY;

        if ( Math.abs(moveX) < 10 && Math.abs(moveY) < 10 ) {
            return;
        }

        if(!this.dndFlag) {
            var el = this.dndParams.el;
            el.innerHTML = componentsMap.get(this.dndParams.uid).name;

            el.style.position = 'absolute';
            el.style.zIndex = 1000;

            this.dndParams.pageX = this.dndParams.dragStartX + 10;
            this.dndParams.pageY = this.dndParams.dragStartY + 10;

            el.style.transform = `translate(${this.dndParams.pageX}px,
            ${this.dndParams.pageY}px)`;

            this.domOverlay.appendChild(el);
            this.dndFlag = true;
        }

        this.dndParams.pageX = event.pageX + 10;
        this.dndParams.pageY = event.pageY + 10;

        if (this.needRAF) {
            this.needRAF = false;

            this.animationFrame =
                window.requestAnimationFrame(this._handleAnimationFrame);
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
            // event.stopPropagation();

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

            if ( type == 'mousedown' ) {
                if (event.which != 1 || !event.ctrlKey) return;

                event.preventDefault();

                this.dndParams.el = document.createElement('div');
                this.dndParams.uid = owner._currentElement.props.uid;
                this.dndParams.where = owner._currentElement.props.where;
                this.dndParams.dragStartX = event.pageX;
                this.dndParams.dragStartY = event.pageY;

                this._handleStartDrag();
            }
        }
    }

    _createRoute(route, index, prefix) {
        const routeIndex = Array.isArray(index) ? index : [index];

        debugger;
        const path = getRoutePrefix(route, prefix); 

        const ret = {
            path: route.path,
            component: ({ children }) => <Builder
                component={this.props.routes.getIn(routeIndex).component}
                children={children}
                path={path}
                routeIndex={routeIndex}
            />
        };

        if (route.children && route.children.size) {
            ret.childRoutes = route.children
                .map((child, routeIndex) => this._createRoute(
                    child,
                    [].concat(index, 'children', routeIndex),
                    path
                ))
                .toArray();
        }

        return ret;
    }

    render() {
        return (
            <Router history={hashHistory} routes={this.routes} />
        );
    }
}

Preview.propTypes = {
    domOverlay: React.PropTypes.object,
    interactive: PropTypes.bool,
    routes: ImmutablePropTypes.listOf(
        ImmutablePropTypes.contains({
            id: PropTypes.number,
            path: PropTypes.string,
            component: ImmutablePropTypes.contains({
                uid: React.PropTypes.string,
                name: React.PropTypes.string,
                props: ImmutablePropTypes.map,
                children: ImmutablePropTypes.list
            })
        })
    ),
    selected: ImmutablePropTypes.set,
    highlighted: ImmutablePropTypes.set,
    deselectComponent: PropTypes.func,
    selectComponent: PropTypes.func,
    unhighlightComponent: PropTypes.func,
    highlightComponent: PropTypes.func,
    setWorkspace: PropTypes.func
};

Preview.defaultProps = {
    domOverlay: null,
    interactive: false,
    routes: List(),
    selected: Set(),
    highlighted: Set(),
    deselectComponent: /* istanbul ignore next */ () => {},
    selectComponent: /* istanbul ignore next */ () => {},
    highlightComponent: /* istanbul ignore next */ () => {},
    unhighlightComponent: /* istanbul ignore next */ () => {},
    setWorkspace: /* istanbul ignore next */ () => {}
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
    unhighlightComponent: highlighted => void dispatch(unhighlightPreviewComponent(highlighted)),
    componentUpdateRoute: (source, target) => void dispatch(componentUpdateRoute(source, target)),
    setWorkspace: component => void dispatch(setPreviewWorkspace(component)),
    unsetWorkspace: component => void dispatch(unsetPreviewWorkspace(component)),
    showWorkspace: () => void dispatch(showPreviewWorkspace()),
    hideWorkspace: () => void dispatch(hidePreviewWorkspace())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
