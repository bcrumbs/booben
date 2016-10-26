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
    moveComponent,
    createComponent,
    createRootComponent
} from '../../app/actions/project';

import { pointIsInCircle } from '../../app/utils/misc';


/**
 *
 * @type {number}
 * @const
 */
const START_DRAG_THRESHOLD = 10;

/**
 *
 * @class
 * @extends Immutable.Record
 */
const RouteRootComponentIds = Record({
    componentId: null,
    indexComponentId: null
});

/**
 *
 * @param {Immutable.List<ProjectRoute>} routes
 * @return {Immutable.Map<number, RouteRootComponentIds>}
 */
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
 * @param {HTMLElement} el
 * @return {?number}
 */
const getClosestComponentId = el => {
    let current = el;

    while (current) {
        const dataJssyId = current.getAttribute('data-jssy-id');
        if (dataJssyId) return parseInt(dataJssyId, 10);
        if (current.hasAttribute('data-reactroot')) break;
        current = current.parentNode;
    }

    return null;
};

/**
 * @typedef {Object} OverWhat
 * @property {boolean} isPlaceholder
 * @property {?number} componentId
 * @property {?number} placeholderAfter
 * @property {?number} containerId
 */

/**
 *
 * @param {HTMLElement} el
 * @return {?OverWhat}
 */
const getClosestComponentOrPlaceholder = el => {
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
};

/**
 *
 * @param {ProjectComponent} component
 * @return {Function}
 */
const makeBuilder = component => {
    const ret = ({ children }) => (
        <Builder
            component={component}
            children={children}
        />
    );

    ret.displayName = `Builder(${component ? String(component.id) : 'null'})`;
    return ret;
};

class Preview extends Component {
    constructor(props) {
        super(props);

        this.domNode = null;
        this.willTryStartDrag = false;
        this.componentToDrag = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.currentRouteId = null;
        this.rootComponentIds = null;
        this.routes = null;
        this.routerKey = 0;

        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseOver = this._handleMouseOver.bind(this);
        this._handleMouseOut = this._handleMouseOut.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleChangeRoute = this._handleChangeRoute.bind(this);
        this._createRoute = this._createRoute.bind(this);

        this._receiveRoutes(props.project.routes);
    }

    componentDidMount() {
        this.domNode = document.getElementById('container');

        if (this.props.interactive) {
            this.domNode.addEventListener('mouseover', this._handleMouseOver, false);
            this.domNode.addEventListener('mouseout', this._handleMouseOut, false);
            this.domNode.addEventListener('mousedown', this._handleMouseDown, false);
            this.domNode.addEventListener('click', this._handleClick, false);
            this.domNode.addEventListener('mouseup', this._handleMouseUp);
            window.top.addEventListener('mouseup', this._handleMouseUp);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.project.routes !== this.props.project.routes)
            this._receiveRoutes(nextProps.project.routes);
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
            this.domNode.removeEventListener('mouseup', this._handleMouseUp);
            window.top.removeEventListener('mouseup', this._handleMouseUp);
        }

        this.domNode = null;
    }

    /**
     *
     * @param {number} routeId
     * @private
     */
    _handleChangeRoute(routeId) {
        this.currentRouteId = routeId;
    }

    /**
     *
     * @param {ProjectRoute} route
     * @return {Object}
     * @private
     */
    _createRoute(route) {
        const ret = {
            path: route.path,
            component: makeBuilder(route.component)
        };

        ret.onEnter = this._handleChangeRoute.bind(this, route.id);

        if (route.children.size > 0)
            ret.childRoutes = route.children.map(this._createRoute).toArray();

        if (route.haveRedirect) {
            ret.onEnter = (_, replace) => replace(route.redirectTo);
        }
        else if (route.haveIndex) {
            ret.indexRoute = {
                component: makeBuilder(route.indexComponent)
            };
        }

        return ret;
    }

    /**
     *
     * @param {Immutable.List<ProjectRoute>} routes
     * @private
     */
    _receiveRoutes(routes) {
        this.rootComponentIds = gatherRootComponentIds(routes);
        this.routes = routes.map(this._createRoute).toArray();
        this.routerKey++;
    }

    /**
     *
     * @param {number} id
     * @return {ProjectComponent}
     * @private
     */
    _getComponentById(id) {
        const componentIndexData = this.props.componentsIndex.get(id);
        return this.props.project.getIn(componentIndexData.path);
    }

    /**
     *
     * @return {?number}
     * @private
     */
    _getCurrentRootComponentId() {
        const rootComponentIds = this.rootComponentIds.get(this.currentRouteId);
        if (!rootComponentIds) return null;

        return this.props.currentRouteIsIndexRoute
            ? rootComponentIds.indexComponentId
            : rootComponentIds.componentId
    }

    /**
     *
     * @param {number} componentId
     * @return {boolean}
     * @private
     */
    _componentIsInCurrentRoute(componentId) {
        const componentIndexData = this.props.componentsIndex.get(componentId);

        return componentIndexData.routeId === this.currentRouteId &&
            componentIndexData.isIndexRoute === this.props.currentRouteIsIndexRoute;
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseDown(event) {
        if (event.button != 0 || !event.ctrlKey) return;

        event.preventDefault();

        //noinspection JSCheckFunctionSignatures
        const componentId = getClosestComponentId(event.target);

        if (componentId !== null && this._componentIsInCurrentRoute(componentId)) {
            this.domNode.addEventListener('mousemove', this._handleMouseMove);

            this.componentToDrag = this._getComponentById(componentId);
            this.dragStartX = event.pageX;
            this.dragStartY = event.pageY;
            this.willTryStartDrag = true;
        }
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseMove(event) {
        if (this.willTryStartDrag) {
            const willStartDrag = !pointIsInCircle(
                event.pageX,
                event.pageY,
                this.dragStartX,
                this.dragStartY,
                START_DRAG_THRESHOLD
            );

            if (willStartDrag) {
                this.domNode.removeEventListener('mousemove', this._handleMouseMove);
                this.willTryStartDrag = false;
                this.props.onSetBoundaryComponent(this._getCurrentRootComponentId());
                this.props.onToggleHighlighting(false);
                this.props.onComponentStartDrag(this.componentToDrag);
            }
        }
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseUp(event) {
        event.stopPropagation();

        this.willTryStartDrag = false;

        if (this.props.draggingComponent) {
            this.props.onSetBoundaryComponent(null);

            const willDrop =
                this.props.draggingOverPlaceholder && (
                    this.props.placeholderContainerId === -1 ||
                    this._componentIsInCurrentRoute(this.props.placeholderContainerId)
                );

            if (willDrop) {
                if (this.props.draggedComponent.id !== null) {
                    // We're dragging an existing component
                    this.props.onMoveComponent(
                        this.props.draggedComponent.id,
                        this.props.placeholderContainerId,
                        this.props.placeholderAfter
                    );
                }
                else {
                    // We're dragging a new component from palette
                    if (this.props.placeholderContainerId === -1) {
                        // Creating root component for current route
                        this.props.onCreateRootComponent(
                            this.currentRouteId,
                            this.props.currentRouteIsIndexRoute,
                            this.props.draggedComponent
                        );
                    }
                    else {
                        // Creating nested component
                        this.props.onCreateComponent(
                            this.props.placeholderContainerId,
                            this.props.placeholderAfter,
                            this.props.draggedComponent
                        );
                    }
                }
            }

            this.props.onToggleHighlighting(true);
            this.props.onComponentStopDrag();
        }
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseOver(event) {
        if (this.props.highlightingEnabled) {
            //noinspection JSCheckFunctionSignatures
            const componentId = getClosestComponentId(event.target);

            if (componentId !== null && this._componentIsInCurrentRoute(componentId))
                this.props.onHighlightComponent(componentId);
        }

        if (this.props.draggingComponent) {
            //noinspection JSCheckFunctionSignatures
            const overWhat = getClosestComponentOrPlaceholder(event.target);
            if (overWhat !== null) {
                if (overWhat.isPlaceholder) {
                    this.props.onDragOverPlaceholder(
                        overWhat.containerId,
                        overWhat.placeholderAfter
                    );
                }
                else if (this._componentIsInCurrentRoute(overWhat.componentId)) {
                    this.props.onDragOverComponent(overWhat.componentId);
                }
            }
        }
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseOut(event) {
        if (this.props.highlightingEnabled) {
            //noinspection JSCheckFunctionSignatures
            const componentId = getClosestComponentId(event.target);

            if (componentId !== null && this._componentIsInCurrentRoute(componentId))
                this.props.onUnhighlightComponent(componentId);
        }
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleClick(event) {
        if (event.ctrlKey) {
            //noinspection JSCheckFunctionSignatures
            const componentId = getClosestComponentId(event.target);

            if (componentId !== null && this._componentIsInCurrentRoute(componentId))
                this.props.onToggleComponentSelection(componentId);
        }
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
    onMoveComponent: PropTypes.func,
    onCreateComponent: PropTypes.func,
    onCreateRootComponent: PropTypes.func
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

    onComponentStartDrag: component =>
        void dispatch(startDragComponent(component)),

    onComponentStopDrag: () =>
        void dispatch(stopDragComponent()),

    onDragOverComponent: componentId =>
        void dispatch(dragOverComponent(componentId)),

    onDragOverPlaceholder: (containerId, afterIdx) =>
        void dispatch(dragOverPlaceholder(containerId, afterIdx)),

    onMoveComponent: (componentId, containerId, position) =>
        void dispatch(moveComponent(componentId, containerId, position)),

    onCreateComponent: (containerId, position, component) =>
        void dispatch(createComponent(containerId, position, component)),

    onCreateRootComponent: (routeId, isIndexRoute, component) =>
        void dispatch(createRootComponent(routeId, isIndexRoute, component))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
