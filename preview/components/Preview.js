'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Record, Map } from 'immutable';

import Builder from './Builder';

import {
    selectPreviewComponent,
    deselectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    setRootComponent,
    unsetRootComponent,
    showPreviewRootComponent,
    hidePreviewRootComponent,
    setDomElementToMap
} from '../../app/actions/preview';

import {
    deleteComponent
} from '../../app/actions/project';

const OFFSET_DND_AVATAR = 10;

/**
 * Get owner React element by condition
 *
 * @param  {function} el
 * @param  {function} [condition]
 * @return {function}
 */
const getOwner = (el, condition) => {
    if(condition(el)) return el;

    const owner = el._currentElement._owner;
    if (!owner) return null;
    if (!condition) return owner;

    return getOwner(owner, condition);
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
            if(condition(el._renderedChildren[key])) return el._renderedChildren[key];

            child = getChild(el._renderedChildren[key], condition);
            if(child) return child;
        }

        return null;
    }
};

const RouteRootComponentIds = Record({
    componentId: null,
    indexComponentId: null
});

class Preview extends Component {
    constructor(props) {
        super(props);

        this.domNode = null;
        this.domOverlay = null;
        this.dndParams = {};
        this.dndFlag = false;
        this.animationFrame = null;
        this.needRAF = true;
        this.currentRouteId = null;
        this.rootComponentIds = this._gatherRootComponentIds(props.project.routes);
        this.currentOwner = null;

        this._nextRouterKey = 0;

        this._handleResizeEvent = this._handleResizeEvent.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleStartDrag = this._handleStartDrag.bind(this);
        this._handleStopDrag = this._handleStopDrag.bind(this);
        this._handleAnimationFrame = this._handleAnimationFrame.bind(this);
        this._handleChangeRoute = this._handleChangeRoute.bind(this);
        this._handleMouseOverEvent = this._handleMouseOverEvent.bind(this);
        this._handleMouseOutEvent = this._handleMouseOutEvent.bind(this);
        this._handleMouseDownEvent = this._handleMouseDownEvent.bind(this);
    }

    componentDidMount() {
        this.domNode = document.getElementById('container');
        this.domOverlay = this.props.domOverlay;

        if(this.props.interactive) {
            const domNode = this.domNode;

            domNode.addEventListener('mouseover', this._handleMouseOverEvent, false);
            domNode.addEventListener('dragover', this._handleMouseOverEvent, false);
            domNode.addEventListener('dragleave', this._handleMouseOutEvent, false);
            domNode.addEventListener('mouseout', this._handleMouseOutEvent, false);
            domNode.addEventListener('mousedown', this._handleMouseDownEvent, false);
            window.addEventListener('resize', this._handleResizeEvent, false);

            this._setRootComponent();
        }
    }

    componentWillUnmount() {
        const domNode = this.domNode;

        if (this.props.interactive) {
            domNode.removeEventListener('mouseover', this._handleMouseOverEvent, false);
            domNode.removeEventListener('dragover', this._handleMouseOverEvent, false);
            domNode.removeEventListener('dragleave', this._handleMouseOutEvent, false);
            domNode.removeEventListener('mouseout', this._handleMouseOutEvent, false);
            domNode.removeEventListener('mousedown', this._handleMouseDownEvent, false);
            window.removeEventListener('resize', this._handleResizeEvent, false);
        }

        this.domNode = null;
        this.domOverlay = null;
    }

    componentWillReceiveProps(nextProps) {
        this.rootComponentIds = this._gatherRootComponentIds(nextProps.project.routes);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.project !== this.props.project;
    }

    _gatherRootComponentIds(routes) {
        const reducer = (acc, route) => {
            acc = acc.set(route.id, new RouteRootComponentIds({
                componentId: route.component ? route.component.id : null,
                indexComponentId: route.indexComponent ? route.indexComponent.id : null
            }));

            return route.children.reduce(reducer, acc);
        };

        return routes.reduce(reducer, Map());
    }

    _getCurrentRootComponentId() {
        const rootComponentIds = this.rootComponentIds.get(this.currentRouteId);
        if (!rootComponentIds) return null;

        return this.props.currentRouteIsIndexRoute
            ? rootComponentIds.indexComponentId
            : rootComponentIds.componentId
    }

    _getComponentId(el) {
        return el._currentElement && el._currentElement.props['data-id'];
    }

    _setRootComponent() {
        const rootComponentId = this._getCurrentRootComponentId();

        const rootComponent = getChild(this['_reactInternalInstance'],
            item => this._getComponentId(item) == rootComponentId);

        if(!rootComponent) return;

        this.props.setRootComponent(rootComponentId);
        this._setDomElementToMap(rootComponentId, rootComponent.getHostNode());
    }

    _handleResizeEvent() {}

    /**
     * Get array of selected components
     *
     * @param  {function} el
     * @param  {string} id
     */
    _updateSelected(id) {
        if (this.props.selected.has(id)) {
            this.props.deselectComponent(id);
        } else {
            this.props.selectComponent(id)
        }
    }

    /**
     * Get array of highlighted components
     *
     * @param  {string} id
     */
    _updateHighlighted(id) {
        if (this.props.highlighted.has(id)) {
            this.props.unhighlightComponent(id);
        } else {
            this.props.highlightComponent(id);
        }
    }

    _setDomElementToMap(key, value) {
        if (!this.props.domElementsMap.has(key)) {
            this.props.setDomElementToMap(key, value);
        }
    }

    _componentIsInCurrentRoute(id) {
        const componentRouteId = this.props.componentsIndex.get(id).routeId;
        return componentRouteId === this.currentRouteId;
    }

    _getOwner(target) {
        const keys = Object.keys(target),
            riiKey = keys.find(key => key.startsWith('__reactInternalInstance$'));

        if (!riiKey) return null;

        const owner = getOwner(target[riiKey], (item)=> {
                return this._getComponentId(item);
            });

        return owner;
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
    }

    _handleStopDrag(event) {
        this.domNode.removeEventListener('mousemove', this._handleDrag);
        this.domNode.removeEventListener('mouseup', this._handleStopDrag);
        window.top.removeEventListener('mouseup', this._handleStopDrag);

        this.props.hideRootComponent();

        if(!this.dndFlag) return;

        this.dndFlag = false;

        const owner = this.currentOwner;

        if (owner && this.dndParams) {
            if(
                owner &&
                this._getComponentId(owner) &&
                this._getComponentId(owner) != this.dndParams.id
            ) {
                // write something here
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

        if (!this.dndFlag) {
            const componentIndexData = this.props.componentsIndex.get(this.dndParams.id),
                component = this.props.project.getIn(componentIndexData.path);

            var el = this.dndParams.el;
            el.innerHTML = component.name;

            el.style.position = 'absolute';
            el.style.zIndex = 1000;

            this.dndParams.pageX = this.dndParams.dragStartX + OFFSET_DND_AVATAR;
            this.dndParams.pageY = this.dndParams.dragStartY + OFFSET_DND_AVATAR;

            el.style.transform = `translate(${this.dndParams.pageX}px,
            ${this.dndParams.pageY}px)`;

            this.domOverlay.appendChild(el);
            this.dndFlag = true;

            this.props.componentDeleteFromRoute(this.dndParams.id);

            this.props.showRootComponent();
        }

        this.dndParams.pageX = event.pageX + OFFSET_DND_AVATAR;
        this.dndParams.pageY = event.pageY + OFFSET_DND_AVATAR;

        if (this.needRAF) {
            this.needRAF = false;

            this.animationFrame =
                window.requestAnimationFrame(this._handleAnimationFrame);
        }
    }

    _handleMouseOverEvent(event) {
        const owner = this._getOwner(event.target),
            id = this._getComponentId(owner);

        if(!this._componentIsInCurrentRoute(id)) return;

        this._setDomElementToMap(id, owner.getHostNode());
        this._updateHighlighted(id);

        this.currentOwner = owner;
    }

    _handleMouseClickEvent(event) {
        const owner = this.currentOwner,
            id = owner && this._getComponentId(owner) || null;

        if (id === null || !this._componentIsInCurrentRoute(id)) return;

        if(!event.ctrlKey) return;
        this._updateSelected(id);
    }

    _handleMouseOutEvent(event) {
        const owner = this.currentOwner,
            id = owner && this._getComponentId(owner) || null;

        if (id === null || !this._componentIsInCurrentRoute(id)) return;

        this._updateHighlighted(id);
        this.currentOwner = null;
    }

    _handleMouseDownEvent(event) {
        if (event.which != 1 || !event.ctrlKey) return;

        const owner = this.currentOwner,
            id = owner && this._getComponentId(owner) || null;

        if (id === null || !this._componentIsInCurrentRoute(id)) return;

        event.preventDefault();

        this.dndParams.el = document.createElement('div');
        this.dndParams.id = id;
        this.dndParams.dragStartX = event.pageX;
        this.dndParams.dragStartY = event.pageY;

        this._handleStartDrag();
    }

    _handleChangeRoute(routeId) {
        this.currentRouteId = routeId;
    }

    _createRoute(route) {
        const ret = {
            path: route.path,
            component: ({ children }) => (
                <Builder
                    component={route.component}
                    children={children}
                />
            )
        };

        if(route) {
            ret.onEnter = this._handleChangeRoute.bind(this, route.id);
        }

        if (route.children.size > 0) {
            ret.childRoutes = route.children
                .map((child, routeIndex) => this._createRoute(child))
                .toArray();
        }

        if (route.haveRedirect) {
            ret.onEnter = (nextState, replace) => replace(route.redirectTo);
        }
        else if (route.haveIndex) {
            ret.indexRoute = {
                component: ({ children }) => (
                    <Builder
                        component={route.indexComponent}
                        children={children}
                    />
                )
            };
        }

        return ret;
    }

    render() {
        const routes = this.props.project.routes
            .map((route, idx) => this._createRoute(route, [idx]))
            .toArray();

        return (
            <Router
                key={String(this._nextRouterKey++)}
                history={hashHistory}
                routes={routes}
            />
        );
    }
}

Preview.propTypes = {
    domOverlay: React.PropTypes.object,
    interactive: PropTypes.bool,

    // Can't use ImmutablePropTypes.record or PropTypes.instanceOf(ProjectRecord) here
    // 'cause this value comes from another frame with another instance of immutable.js
    project: PropTypes.any,
    componentsIndex: ImmutablePropTypes.map,
    selected: ImmutablePropTypes.set,
    highlighted: ImmutablePropTypes.set,
    currentRouteIsIndexRoute: PropTypes.bool,

    deselectComponent: PropTypes.func,
    selectComponent: PropTypes.func,
    unhighlightComponent: PropTypes.func,
    highlightComponent: PropTypes.func,
    setRootComponent: PropTypes.func,
    unsetRootComponent: PropTypes.func,
    showRootComponent: PropTypes.func,
    hideRootComponent: PropTypes.func,
    setDomElementToMap: PropTypes.func
};

Preview.defaultProps = {
    domOverlay: null,
    interactive: false
};

Preview.displayName = 'Preview';

const mapStateToProps = state => ({
    project: state.project.data,
    componentsIndex: state.project.componentsIndex,
    selected: state.preview.selectedItems,
    highlighted: state.preview.highlightedItems,
    domElementsMap: state.preview.domElementsMap,
    currentRouteIsIndexRoute: state.preview.currentRouteIsIndexRoute
});

const mapDispatchToProps = dispatch => ({
    deselectComponent: selected => void dispatch(deselectPreviewComponent(selected)),
    selectComponent: selected => void dispatch(selectPreviewComponent(selected)),
    highlightComponent: highlighted => void dispatch(highlightPreviewComponent(highlighted)),
    unhighlightComponent: highlighted => void dispatch(unhighlightPreviewComponent(highlighted)),
    componentDeleteFromRoute: (where) => void dispatch(deleteComponent(where)),
    setRootComponent: component => void dispatch(setRootComponent(component)),
    unsetRootComponent: component => void dispatch(unsetRootComponent(component)),
    showRootComponent: () => void dispatch(showPreviewRootComponent()),
    hideRootComponent: () => void dispatch(hidePreviewRootComponent()),
    setDomElementToMap: (id, component) => void dispatch(setDomElementToMap(id, component))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
