'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Record, Map } from 'immutable';

import Builder from './Builder';
import { getDomOwner } from '../utils';

import {
    selectPreviewComponent,
    deselectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    setRootComponent,
    unsetRootComponent,
    showPreviewRootComponent,
    hidePreviewRootComponent,
    setDomElementMap
} from '../../app/actions/preview';

import {
    deleteComponent,
    componentAddAfter
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
        this.currentOwnerId = null;

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

            this._setDomElementMap();
            this._setRootComponent();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.project !== this.props.project) {
            this._setDomElementMap();
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
        return el && el.getAttribute("data-jssy-id");
    }

    _setRootComponent() {
        const rootComponentId = this._getCurrentRootComponentId(),
            rootComponent = this.domNode
                .querySelector(`[data-jssy-id='${rootComponentId}']`);

        if(!rootComponent) return;

        this.props.setRootComponent(rootComponentId);
    }

    _setDomElementMap() {
        const jssyComponents = this.domNode.querySelectorAll('[data-jssy-id]');

        let componentMap = Map();

        jssyComponents.forEach((item) => {
            componentMap = componentMap.set(item.getAttribute('data-jssy-id'), item);
        });

        this.props.setDomElementMap(componentMap);
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

    _componentIsInCurrentRoute(id) {
        if(!this.props.componentsIndex.has(id)) return false;

        const componentIndexData = this.props.componentsIndex.get(id);

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

        if(this.dndParams) {
            const sourceIndexData = this.props.componentsIndex.get(this.dndParams.id),
                sourceComponent = this.props.project.getIn(sourceIndexData.path);

            const targetIndexData = this.props.componentsIndex.get(this.currentOwnerId);

            this.props.componentDeleteFromRoute(this.dndParams.id);
            this.props.componentAddAfterToRoute(sourceComponent, targetIndexData.path);
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
        const el = event.target,
            owner = getDomOwner(el, item => item.getAttribute("data-jssy-id")),
            id = this._getComponentId(owner);

        if(!this._componentIsInCurrentRoute(id)) return;
        this._updateHighlighted(id);

        this.currentOwnerId = id;
    }

    _handleMouseClickEvent(event) {
        const id = this.currentOwnerId;

        if (id === null || !this._componentIsInCurrentRoute(id)) return;

        if(!event.ctrlKey) return;
        this._updateSelected(id);
    }

    _handleMouseOutEvent(event) {
        const id = this.currentOwnerId;

        if (id === null || !this._componentIsInCurrentRoute(id)) return;

        this._updateHighlighted(id);
        this.currentOwnerId = null;
    }

    _handleMouseDownEvent(event) {
        if (event.which != 1 || !event.ctrlKey) return;

        const id = this.currentOwnerId;

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
    setDomElementMap: PropTypes.func
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
    componentAddAfterToRoute: (component) => void dispatch(componentAddAfter(component)),
    setRootComponent: component => void dispatch(setRootComponent(component)),
    unsetRootComponent: component => void dispatch(unsetRootComponent(component)),
    showRootComponent: () => void dispatch(showPreviewRootComponent()),
    hideRootComponent: () => void dispatch(hidePreviewRootComponent()),
    setDomElementMap: (componentMap) => void dispatch(setDomElementMap(componentMap))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
