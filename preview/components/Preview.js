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
    hidePreviewRootComponent
} from '../../app/actions/preview';

import {
    deleteComponent,
    componentAddAfter,
    componentAddBefore
} from '../../app/actions/project';

const OFFSET_DND_AVATAR = 10;

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
        this._nextRouterKey = 0;

        this._handleDrag = this._handleDrag.bind(this);
        this._handleStartDrag = this._handleStartDrag.bind(this);
        this._handleStopDrag = this._handleStopDrag.bind(this);
        this._handleAnimationFrame = this._handleAnimationFrame.bind(this);
        this._handleChangeRoute = this._handleChangeRoute.bind(this);
        this._handleMouseOverEvent = this._handleMouseOverEvent.bind(this);
        this._handleMouseOutEvent = this._handleMouseOutEvent.bind(this);
        this._handleMouseDownEvent = this._handleMouseDownEvent.bind(this);
        this._handleMouseClickEvent = this._handleMouseClickEvent.bind(this);
    }

    componentDidMount() {
        this.domNode = document.getElementById('container');
        this.domOverlay = this.props.domOverlay;

        if (this.props.interactive) {
            const domNode = this.domNode;

            domNode.addEventListener('mouseover', this._handleMouseOverEvent, false);
            domNode.addEventListener('dragover', this._handleMouseOverEvent, false);
            domNode.addEventListener('dragleave', this._handleMouseOutEvent, false);
            domNode.addEventListener('mouseout', this._handleMouseOutEvent, false);
            domNode.addEventListener('mousedown', this._handleMouseDownEvent, false);
            domNode.addEventListener('click', this._handleMouseClickEvent, false);

            this._setRootComponent();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.rootComponentIds = this._gatherRootComponentIds(nextProps.project.routes);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.project !== this.props.project;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.project !== this.props.project) this._setRootComponent();
    }

    componentWillUnmount() {
        const domNode = this.domNode;

        if (this.props.interactive) {
            domNode.removeEventListener('mouseover', this._handleMouseOverEvent, false);
            domNode.removeEventListener('dragover', this._handleMouseOverEvent, false);
            domNode.removeEventListener('dragleave', this._handleMouseOutEvent, false);
            domNode.removeEventListener('mouseout', this._handleMouseOutEvent, false);
            domNode.removeEventListener('mousedown', this._handleMouseDownEvent, false);
        }

        this.domNode = null;
        this.domOverlay = null;
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

    _getComponentIdByElement(el) {
        let current = el;
        
        while (current) {
            const dataJssyId = current.getAttribute('data-jssy-id');
            if (dataJssyId) return parseInt(dataJssyId, 10);
            current = current.parentNode;
        }
        
        return null;
    }

    _setRootComponent() {
        const rootComponentId = this._getCurrentRootComponentId(),
            rootComponent = this.domNode
                .querySelector(`[data-jssy-id="${rootComponentId}"]`);

        if(!rootComponent) return;

        this.props.setRootComponent(rootComponentId);
    }

    /**
     *
     * @param  {string} componentId
     */
    _updateSelected(componentId) {
        if (this.props.selected.has(componentId)) {
            this.props.deselectComponent(componentId);
        }
        else {
            this.props.selectComponent(componentId);
        }
    }

    _componentIsInCurrentRoute(componentId) {
        if(!this.props.componentsIndex.has(componentId)) return false;

        const componentIndexData = this.props.componentsIndex.get(componentId);

        return componentIndexData.routeId === this.currentRouteId &&
            componentIndexData.isIndexRoute === this.props.currentRouteIsIndexRoute;
    }

    _handleAnimationFrame() {
        var el = this.dndParams.el;

        el.style.transform =
            `translate(${this.dndParams.pageX}px, ${this.dndParams.pageY}px)`;

        this.animationFrame = null;
        this.needRAF = true;
    }

    _handleStartDrag() {
        if (this.dndFlag) return;

        this.domNode.addEventListener('mousemove', this._handleDrag);
        this.domNode.addEventListener('mouseup', this._handleStopDrag);
        window.top.addEventListener('mouseup', this._handleStopDrag);
    }

    _handleStopDrag(event) {
        event.stopPropagation();

        this.domNode.removeEventListener('mousemove', this._handleDrag);
        this.domNode.removeEventListener('mouseup', this._handleStopDrag);
        window.top.removeEventListener('mouseup', this._handleStopDrag);

        this.props.hideRootComponent();

        if (!this.dndFlag) return;

        this.dndFlag = false;

        if (this.dndParams) {
            const sourceComponentId = this.dndParams.sourceId,
                componentIndexData = this.props.componentsIndex.get(sourceComponentId),
                component = this.props.project.getIn(componentIndexData.path),
                targetComponentId = this._getComponentIdByElement(event.target);

            if (this._componentIsInCurrentRoute(targetComponentId)) {
                this.props.componentDeleteFromRoute(this.dndParams.sourceId);
                this.props.componentAddBeforeToRoute(component, targetComponentId);
            }

            this.props.unhighlightComponent(targetComponentId);
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

        if (Math.abs(moveX) < 10 && Math.abs(moveY) < 10) return;

        if (!this.dndFlag) {
            const componentIndexData = this.props.componentsIndex.get(this.dndParams.sourceId),
                component = this.props.project.getIn(componentIndexData.path);

            const el = this.dndParams.el;
            el.innerHTML = component.name;

            el.style.position = 'absolute';
            el.style.zIndex = 1000;

            this.dndParams.pageX = this.dndParams.dragStartX + OFFSET_DND_AVATAR;
            this.dndParams.pageY = this.dndParams.dragStartY + OFFSET_DND_AVATAR;

            el.style.transform = `translate(${this.dndParams.pageX}px,
            ${this.dndParams.pageY}px)`;

            this.domOverlay.appendChild(el);
            this.dndFlag = true;

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
        const componentId = this._getComponentIdByElement(event.target);

        if (componentId !== null && this._componentIsInCurrentRoute(componentId))
            this.props.highlightComponent(componentId);
    }

    _handleMouseOutEvent(event) {
        const componentId = this._getComponentIdByElement(event.target);

        if (componentId !== null && this._componentIsInCurrentRoute(componentId))
            this.props.unhighlightComponent(componentId);
    }

    _handleMouseClickEvent(event) {
        if (!event.ctrlKey) return;

        const componentId = this._getComponentIdByElement(event.target);

        if (componentId !== null && this._componentIsInCurrentRoute(componentId))
            this._updateSelected(componentId);
    }

    _handleMouseDownEvent(event) {
        if (event.which != 1 || !event.ctrlKey) return;

        const componentId = this._getComponentIdByElement(event.target);
        if (componentId === null || !this._componentIsInCurrentRoute(componentId)) return;

        event.preventDefault();

        this.dndParams.el = document.createElement('div');
        this.dndParams.sourceId = componentId;
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

        ret.onEnter = this._handleChangeRoute.bind(this, route.id);

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
    hideRootComponent: PropTypes.func
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
    highlightComponent: highlighted => void dispatch(
        highlightPreviewComponent(highlighted)),
    unhighlightComponent: highlighted => void dispatch(
        unhighlightPreviewComponent(highlighted)),
    componentDeleteFromRoute: (id) => void dispatch(deleteComponent(id)),
    componentAddAfterToRoute: (component, targetId) => void dispatch(componentAddAfter(component, targetId)),
    componentAddBeforeToRoute: (component, targetId) => void dispatch(componentAddBefore(component, targetId)),
    setRootComponent: component => void dispatch(setRootComponent(component)),
    unsetRootComponent: component => void dispatch(unsetRootComponent(component)),
    showRootComponent: () => void dispatch(showPreviewRootComponent()),
    hideRootComponent: () => void dispatch(hidePreviewRootComponent())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
