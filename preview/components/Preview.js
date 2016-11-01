'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';

import Builder from './Builder';

import {
    toggleComponentSelection,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    startDragExistingComponent,
    dragOverComponent,
    dragOverPlaceholder,
    dropComponent,
    setCurrentRoute
} from '../../app/actions/preview';

import { getComponentById } from '../../app/models/Project';

import { pointIsInCircle } from '../../app/utils/misc';


/**
 *
 * @type {?HTMLElement}
 */
let _container = null;

/**
 *
 * @return {HTMLElement}
 */
const getContainer = () =>
    _container || (_container = document.getElementById('container'));

/**
 *
 * @type {number}
 * @const
 */
const START_DRAG_THRESHOLD = 10;

/**
 *
 * @param {HTMLElement} el
 * @return {?number}
 */
const getClosestComponentId = el => {
    const containerNode = getContainer();
    let current = el;

    while (current) {
        if (el === containerNode) break;
        const dataJssyId = current.getAttribute('data-jssy-id');
        if (dataJssyId) return parseInt(dataJssyId, 10);
        if (current.hasAttribute('data-reactroot')) break;
        current = current.parentNode;
    }

    return -1;
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
 * @param {Immutable.Map<number, ProjectComponent>} components
 * @param {number} rootId
 * @return {Function}
 */
const makeBuilder = (components, rootId) => {
    const ret = ({ children }) => (
        <Builder
            components={components}
            rootId={rootId}
            children={children}
        />
    );

    ret.displayName = `Builder(${rootId === -1 ? 'null' : rootId})`;
    return ret;
};

class Preview extends Component {
    constructor(props) {
        super(props);

        this.willTryStartDrag = false;
        this.componentIdToDrag = -1;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.routes = null;
        this.routerKey = 0;

        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseOver = this._handleMouseOver.bind(this);
        this._handleMouseOut = this._handleMouseOut.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handleChangeRoute = this._handleChangeRoute.bind(this);

        this._updateRoutes(props.project.routes, props.project.rootRoutes);
    }

    componentDidMount() {
        if (this.props.interactive) {
            const containerNode = getContainer();
            containerNode.addEventListener('mouseover', this._handleMouseOver, false);
            containerNode.addEventListener('mouseout', this._handleMouseOut, false);
            containerNode.addEventListener('mousedown', this._handleMouseDown, false);
            containerNode.addEventListener('click', this._handleClick, false);
            containerNode.addEventListener('mouseup', this._handleMouseUp);
            window.top.addEventListener('mouseup', this._handleMouseUp);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.project !== this.props.project)
            this._updateRoutes(nextProps.project.routes, nextProps.project.rootRoutes);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.project !== this.props.project;
    }

    componentWillUnmount() {
        if (this.props.interactive) {
            const containerNode = getContainer();
            containerNode.removeEventListener('mouseover', this._handleMouseOver, false);
            containerNode.removeEventListener('mouseout', this._handleMouseOut, false);
            containerNode.removeEventListener('mousedown', this._handleMouseDown, false);
            containerNode.removeEventListener('click', this._handleClick, false);
            containerNode.removeEventListener('mouseup', this._handleMouseUp);
            window.top.removeEventListener('mouseup', this._handleMouseUp);
        }
    }

    /**
     *
     * @param {number} routeId
     * @param {boolean} isIndexRoute
     * @private
     */
    _handleChangeRoute(routeId, isIndexRoute) {
        this.props.onRouteChange(routeId, isIndexRoute);
    }

    /**
     *
     * @param {Object} routes
     * @param {number} routeId
     * @return {Object}
     * @private
     */
    _createRoute(routes, routeId) {
        const route = routes.get(routeId);

        const ret = {
            path: route.path,
            component: makeBuilder(route.components, route.component)
        };

        ret.onEnter = this._handleChangeRoute.bind(this, route.id, false);

        if (route.children.size > 0) {
            ret.childRoutes = route.children
                .map(childRouteId => this._createRoute(routes, childRouteId))
                .toArray();
        }

        if (route.haveRedirect) {
            ret.onEnter = (_, replace) => replace(route.redirectTo);
        }
        else if (route.haveIndex) {
            ret.indexRoute = {
                component: makeBuilder(route.components, route.indexComponent),
                onEnter: this._handleChangeRoute.bind(this, route.id, true)
            };
        }

        return ret;
    }

    /**
     * Build routes config for react-router
     *
     * @param {Immutable.Map} routes
     * @param {Immutable.List<number>} rootRouteIds
     * @private
     */
    _updateRoutes(routes, rootRouteIds) {
        this.routes = rootRouteIds
            .map(routeId => this._createRoute(routes, routeId))
            .toArray();

        this.routerKey++;
    }

    /**
     *
     * @param {number} componentId
     * @return {boolean}
     * @private
     */
    _componentIsInCurrentRoute(componentId) {
        const component = getComponentById(this.props.project, componentId);

        return component.routeId === this.props.currentRouteId &&
            component.isIndexRoute === this.props.currentRouteIsIndexRoute;
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

        if (componentId > -1 && this._componentIsInCurrentRoute(componentId)) {
            getContainer().addEventListener('mousemove', this._handleMouseMove);
            this.componentIdToDrag = componentId;
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
                getContainer().removeEventListener('mousemove', this._handleMouseMove);
                this.willTryStartDrag = false;
                this.props.onComponentStartDrag(this.componentIdToDrag);
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
        if (this.props.draggingComponent) this.props.onDropComponent();
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

            if (componentId > -1 && this._componentIsInCurrentRoute(componentId))
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

            if (componentId > -1 && this._componentIsInCurrentRoute(componentId))
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

            if (componentId > -1 && this._componentIsInCurrentRoute(componentId))
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
    interactive: PropTypes.bool,

    // Can't use ImmutablePropTypes.record or PropTypes.instanceOf(ProjectRecord) here
    // 'cause this value comes from another frame with another instance of immutable.js
    project: PropTypes.any,
    meta: PropTypes.object,
    draggingComponent: PropTypes.bool,
    highlightingEnabled: PropTypes.bool,
    currentRouteId: PropTypes.number,
    currentRouteIsIndexRoute: PropTypes.bool,

    onToggleComponentSelection: PropTypes.func,
    onHighlightComponent: PropTypes.func,
    onUnhighlightComponent: PropTypes.func,
    onComponentStartDrag: PropTypes.func,
    onDragOverComponent: PropTypes.func,
    onDragOverPlaceholder: PropTypes.func,
    onDropComponent: PropTypes.func,
    onRouteChange: PropTypes.func
};

Preview.defaultProps = {
    interactive: false
};

Preview.displayName = 'Preview';

const mapStateToProps = ({ project }) => ({
    project: project.data,
    meta: project.meta,
    draggingComponent: project.draggingComponent,
    highlightingEnabled: project.highlightingEnabled,
    currentRouteId: project.currentRouteId,
    currentRouteIsIndexRoute: project.currentRouteIsIndexRoute
});

const mapDispatchToProps = dispatch => ({
    onToggleComponentSelection: componentId =>
        void dispatch(toggleComponentSelection(componentId)),

    onHighlightComponent: componentId =>
        void dispatch(highlightPreviewComponent(componentId)),

    onUnhighlightComponent: componentId =>
        void dispatch(unhighlightPreviewComponent(componentId)),

    onComponentStartDrag: componentId =>
        void dispatch(startDragExistingComponent(componentId)),

    onDragOverComponent: componentId =>
        void dispatch(dragOverComponent(componentId)),

    onDragOverPlaceholder: (containerId, afterIdx) =>
        void dispatch(dragOverPlaceholder(containerId, afterIdx)),

    onDropComponent: () =>
        void dispatch(dropComponent()),

    onRouteChange: (routeId, isIndexRoute) =>
        void dispatch(setCurrentRoute(routeId, isIndexRoute))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Preview);
