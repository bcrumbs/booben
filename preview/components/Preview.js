'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Record, Map } from 'immutable';

import Builder from './Builder';

import {
    toggleComponentSelection,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    toggleHighlighting,
    setBoundaryComponent,
    startDragComponent,
    stopDragComponent,
    dragOverComponent,
    dragOverPlaceholder,
} from '../../app/actions/preview';

import {
    moveComponent
} from '../../app/actions/project';

const OFFSET_DND_AVATAR = 10;
const START_DRAG_THRESHOLD = 10;

const RouteRootComponentIds = Record({
    componentId: null,
    indexComponentId: null
});

const gatherRootComponentIds = routes => {
    const reducer = (acc, route) => {
        acc = acc.set(route.id, new RouteRootComponentIds({
            componentId: route.component ? route.component.id : null,
            indexComponentId: route.indexComponent ? route.indexComponent.id : null
        }));

        return route.children.reduce(reducer, acc);
    };

    return routes.reduce(reducer, Map());
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} cX
 * @param {number} cY
 * @param {number} r
 * @return {boolean}
 */
const pointIsInCircle = (x, y, cX, cY, r) => {
    const xx = x - cX,
        yy = y - cY;

    return xx * xx + yy * yy <= r * r;
};

class Preview extends Component {
    constructor(props) {
        super(props);

        this.domNode = null;
        this.dndParams = {
            component: null,
            avatarElement: null,
            dragStartX: 0,
            dragStartY: 0,
            pageX: 0,
            pageY: 0
        };
        this.willTryStartDrag = false;
        this.animationFrame = null;
        this.needRAF = true;
        this.currentRouteId = null;
        this.rootComponentIds = gatherRootComponentIds(props.project.routes);

        this.routes = props.project.routes
            .map((route, idx) => this._createRoute(route, [idx]))
            .toArray();

        this.routerKey = 0;

        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleAnimationFrame = this._handleAnimationFrame.bind(this);
        this._handleMouseOver = this._handleMouseOver.bind(this);
        this._handleMouseOut = this._handleMouseOut.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleChangeRoute = this._handleChangeRoute.bind(this);
    }

    componentDidMount() {
        this.domNode = document.getElementById('container');

        if (this.props.interactive) {
            this.domNode.addEventListener('mouseover', this._handleMouseOver, false);
            this.domNode.addEventListener('mouseout', this._handleMouseOut, false);
            this.domNode.addEventListener('mousedown', this._handleMouseDown, false);
            this.domNode.addEventListener('click', this._handleClick, false);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.project.routes !== this.props.project.routes) {
            this.rootComponentIds = gatherRootComponentIds(nextProps.project.routes);

            this.routes = nextProps.project.routes
                .map((route, idx) => this._createRoute(route, [idx]))
                .toArray();

            this.routerKey++;
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.project !== this.props.project ||
            nextProps.currentRouteIsIndexRoute !== this.props.currentRouteIsIndexRoute;
    }

    componentWillUnmount() {
        if (this.props.interactive) {
            this.domNode.removeEventListener('mouseover', this._handleMouseOver, false);
            this.domNode.removeEventListener('mouseout', this._handleMouseOut, false);
            this.domNode.removeEventListener('mousedown', this._handleMouseDown, false);
            this.domNode.removeEventListener('click', this._handleClick, false);
        }

        this.domNode = null;
    }

    _getComponentById(id) {
        const componentIndexData = this.props.componentsIndex.get(id);
        return this.props.project.getIn(componentIndexData.path);
    }

    _getCurrentRootComponentId() {
        const rootComponentIds = this.rootComponentIds.get(this.currentRouteId);
        if (!rootComponentIds) return null;

        return this.props.currentRouteIsIndexRoute
            ? rootComponentIds.indexComponentId
            : rootComponentIds.componentId
    }

    _getClosestComponentId(el) {
        let current = el;

        while (current) {
            const dataJssyId = current.getAttribute('data-jssy-id');
            if (dataJssyId) return parseInt(dataJssyId, 10);
            if (current.hasAttribute('data-reactroot')) break;
            current = current.parentNode;
        }

        return null;
    }
    
    _getClosestComponentOrPlaceholder(el) {
        let current = el;
        
        while (current) {
            const dataJssyId = current.getAttribute('data-jssy-id');
            if (dataJssyId) {
                return {
                    isPlaceholder: false,
                    componentId: parseInt(dataJssyId, 10),
                    placeholderAfter: null,
                    containerId: null
                };
            }
            else {
                const isPlaceholder = current.hasAttribute('data-jssy-placeholder');

                if (isPlaceholder) {
                    const after = parseInt(current.getAttribute('data-jssy-after'), 10);

                    const containerId =
                        parseInt(current.getAttribute('data-jssy-container-id'), 10);
                    
                    return {
                        isPlaceholder: true,
                        componentId: null,
                        placeholderAfter: after,
                        containerId: containerId
                    }
                }
            }

            if (current.hasAttribute('data-reactroot')) break;
            current = current.parentNode;
        }
        
        return null;
    }

    _componentIsInCurrentRoute(componentId) {
        const componentIndexData = this.props.componentsIndex.get(componentId);

        return componentIndexData.routeId === this.currentRouteId &&
            componentIndexData.isIndexRoute === this.props.currentRouteIsIndexRoute;
    }

    _handleAnimationFrame() {
        var el = this.dndParams.avatarElement;

        el.style.transform =
            `translate(${this.dndParams.pageX}px, ${this.dndParams.pageY}px)`;

        this.animationFrame = null;
        this.needRAF = true;
    }

    _handleMouseDown(event) {
        if (event.button != 0 || !event.ctrlKey) return;

        event.preventDefault();

        this.domNode.addEventListener('mousemove', this._handleMouseMove);
        this.domNode.addEventListener('mouseup', this._handleMouseUp);
        window.top.addEventListener('mouseup', this._handleMouseUp);

        const componentId = this._getClosestComponentId(event.target);

        if (componentId !== null && this._componentIsInCurrentRoute(componentId)) {
            this.dndParams.component = this._getComponentById(componentId);
            this.dndParams.dragStartX = event.pageX;
            this.dndParams.dragStartY = event.pageY;
            this.willTryStartDrag = true;
        }
    }

    /**
     * Start dragging local component
     * @private
     */
    _startDragComponent() {
        const el = document.createElement('div');
        el.innerHTML = this.dndParams.component.name;
        el.style.position = 'absolute';
        el.style.zIndex = 1000;

        this.dndParams.pageX = this.dndParams.dragStartX + OFFSET_DND_AVATAR;
        this.dndParams.pageY = this.dndParams.dragStartY + OFFSET_DND_AVATAR;

        el.style.transform =
            `translate(${this.dndParams.pageX}px,${this.dndParams.pageY}px)`;

        this.props.overlayDomNode.appendChild(el);
        this.dndParams.avatarElement = el;

        this.props.onSetBoundaryComponent(this._getCurrentRootComponentId());
        this.props.onToggleHighlighting(false);

        this.props.onComponentStartDrag(
            this.dndParams.component.name,
            this.dndParams.component
        );
    }

    /**
     * Handle drop of component (both local and non-local)
     *
     * @private
     */
    _dropComponent() {
        this.props.onSetBoundaryComponent(null);

        if (this.animationFrame !== null) {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.needRAF = true;
        this.props.overlayDomNode.removeChild(this.dndParams.avatarElement);

        if (this.props.draggedComponent !== null) {
            const willDrop =
                this.props.draggingOverPlaceholder &&
                this._componentIsInCurrentRoute(this.props.placeholderContainerId);

            if (willDrop) {
                this.props.onMoveComponent(
                    this.props.draggedComponent.id,
                    this.props.placeholderContainerId,
                    this.props.placeholderAfter
                );
            }
        }
        else {
            // TODO: Create new component
        }

        this.props.onToggleHighlighting(true);
        this.props.onComponentStopDrag();
    }

    _handleMouseMove(event) {
        if (this.willTryStartDrag) {
            const willStartDrag = !pointIsInCircle(
                event.pageX,
                event.pageY,
                this.dndParams.dragStartX,
                this.dndParams.dragStartY,
                START_DRAG_THRESHOLD
            );

            if (willStartDrag) {
                this.willTryStartDrag = false;
                this._startDragComponent();
            }
        }

        if (this.props.draggingComponent) {
            if (this.props.draggedComponent !== null) { // Dragging existing component
                this.dndParams.pageX = event.pageX + OFFSET_DND_AVATAR;
                this.dndParams.pageY = event.pageY + OFFSET_DND_AVATAR;

                if (this.needRAF) {
                    this.needRAF = false;

                    this.animationFrame =
                        window.requestAnimationFrame(this._handleAnimationFrame);
                }
            }
            else { // Dragging new component from library
                // TODO: Handle that shit
            }
        }
    }

    _handleMouseUp(event) {
        event.stopPropagation();

        this.willTryStartDrag = false;

        this.domNode.removeEventListener('mousemove', this._handleMouseMove);
        this.domNode.removeEventListener('mouseup', this._handleMouseUp);
        window.top.removeEventListener('mouseup', this._handleMouseUp);

        if (this.props.draggingComponent)
            this._dropComponent(event.target);
    }

    _handleMouseOver(event) {
        if (this.props.highlightingEnabled) {
            const componentId = this._getClosestComponentId(event.target);

            if (componentId !== null && this._componentIsInCurrentRoute(componentId))
                this.props.onHighlightComponent(componentId);
        }

        if (this.props.draggingComponent) {
            const overWhat = this._getClosestComponentOrPlaceholder(event.target);
            if (overWhat !== null) {
                if (!overWhat.isPlaceholder) {
                    if (this._componentIsInCurrentRoute(overWhat.componentId))
                        this.props.onDragOverComponent(overWhat.componentId);
                }
                else {
                    this.props.onDragOverPlaceholder(
                        overWhat.containerId,
                        overWhat.placeholderAfter
                    );
                }
            }
        }
    }

    _handleMouseOut(event) {
        if (this.props.highlightingEnabled) {
            const componentId = this._getClosestComponentId(event.target);

            if (componentId !== null && this._componentIsInCurrentRoute(componentId))
                this.props.onUnhighlightComponent(componentId);
        }
    }

    _handleClick(event) {
        if (!event.ctrlKey) return;

        const componentId = this._getClosestComponentId(event.target);

        if (componentId !== null && this._componentIsInCurrentRoute(componentId))
            this.props.onToggleComponentSelection(componentId);
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
        return (
            <Router
                key={this.routerKey}
                history={hashHistory}
                routes={this.routes}
            />
        );
    }
}

Preview.propTypes = {
    overlayDomNode: React.PropTypes.object,
    interactive: PropTypes.bool,

    // Can't use ImmutablePropTypes.record or PropTypes.instanceOf(ProjectRecord) here
    // 'cause this value comes from another frame with another instance of immutable.js
    project: PropTypes.any,
    componentsIndex: ImmutablePropTypes.map,
    currentRouteIsIndexRoute: PropTypes.bool,
    draggingComponent: PropTypes.bool,
    draggedComponentName: PropTypes.string,
    draggedComponent: PropTypes.any,
    draggingOverPlaceholder: PropTypes.bool,
    placeholderAfter: PropTypes.number,
    placeholderContainerId: PropTypes.any, // number or null
    highlightingEnabled: PropTypes.bool,

    onToggleComponentSelection: PropTypes.func,
    onHighlightComponent: PropTypes.func,
    onUnhighlightComponent: PropTypes.func,
    onToggleHighlighting: PropTypes.func,
    onSetBoundaryComponent: PropTypes.func,
    onComponentStartDrag: PropTypes.func,
    onComponentStopDrag: PropTypes.func,
    onDragOverComponent: PropTypes.func,
    onDragOverPlaceholder: PropTypes.func,
    onMoveComponent: PropTypes.func
};

Preview.defaultProps = {
    overlayDomNode: null,
    interactive: false
};

Preview.displayName = 'Preview';

const mapStateToProps = state => ({
    project: state.project.data,
    componentsIndex: state.project.componentsIndex,
    currentRouteIsIndexRoute: state.preview.currentRouteIsIndexRoute,
    draggingComponent: state.preview.draggingComponent,
    draggedComponentName: state.preview.draggedComponentName,
    draggedComponent: state.preview.draggedComponent,
    draggingOverPlaceholder: state.preview.draggingOverPlaceholder,
    placeholderAfter: state.preview.placeholderAfter,
    placeholderContainerId: state.preview.placeholderContainerId,
    highlightingEnabled: state.preview.highlightingEnabled
});

const mapDispatchToProps = dispatch => ({
    onToggleComponentSelection: componentId =>
        void dispatch(toggleComponentSelection(componentId)),

    onHighlightComponent: componentId =>
        void dispatch(highlightPreviewComponent(componentId)),

    onUnhighlightComponent: componentId =>
        void dispatch(unhighlightPreviewComponent(componentId)),

    onToggleHighlighting: enable =>
        void dispatch(toggleHighlighting(enable)),

    onSetBoundaryComponent: componentId =>
        void dispatch(setBoundaryComponent(componentId)),

    onComponentStartDrag: (componentName, componentId) =>
        void dispatch(startDragComponent(componentName, componentId)),

    onComponentStopDrag: () => void dispatch(stopDragComponent()),
    onDragOverComponent: componentId => void dispatch(dragOverComponent(componentId)),

    onDragOverPlaceholder: (containerId, afterIdx) =>
        void dispatch(dragOverPlaceholder(containerId, afterIdx)),

    onMoveComponent: (componentId, containerId, position) =>
        void dispatch(moveComponent(componentId, containerId, position))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
