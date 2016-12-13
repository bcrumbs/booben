'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';

import Builder from './Builder';

import {
    toggleComponentSelection,
    selectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    startDragExistingComponent,
    dragOverComponent,
    dragOverPlaceholder,
    dropComponent,
    setCurrentRoute,
	DROP_COMPONENT_AREA_IDS
} from '../../app/actions/preview';

import {
    topNestedConstructorSelector
} from '../../app/selectors';

import { getComponentById } from '../../app/models/Project';
import {
    getOutletComponentId,
    getParentComponentId
} from '../../app/models/ProjectRoute';

import { pointIsInCircle } from '../../app/utils/misc';

import { PREVIEW_DOM_CONTAINER_ID } from '../../common/shared-constants';


const setImmediate = setImmediate || (fn => setTimeout(fn, 0));
const clearImmediate = clearImmediate || clearTimeout;


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
    _container || (_container = document.getElementById(PREVIEW_DOM_CONTAINER_ID));

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

        if (current.nodeType !== Node.ELEMENT_NODE) {
            current = current.parentNode;
            continue;
        }

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
        if (current.nodeType !== Node.ELEMENT_NODE) {
            if (!current.parentNode) break;
            current = current.parentNode;
            continue;
        }

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

class Preview extends Component {
    constructor(props) {
        super(props);

        this.willTryStartDrag = false;
        this.componentIdToDrag = -1;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.routes = null;
        this.routerKey = 0;

        this.unhighilightTimer = -1;
        this.unhighlightedComponentId = -1;

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
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.project !== this.props.project)
            this._updateRoutes(nextProps.project.routes, nextProps.project.rootRoutes);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.project !== this.props.project ||
            nextProps.topNestedConstructor !== this.props.topNestedConstructor;
    }

    componentWillUnmount() {
        if (this.props.interactive) {
            const containerNode = getContainer();
            containerNode.removeEventListener('mouseover', this._handleMouseOver, false);
            containerNode.removeEventListener('mouseout', this._handleMouseOut, false);
            containerNode.removeEventListener('mousedown', this._handleMouseDown, false);
            containerNode.removeEventListener('click', this._handleClick, false);
            containerNode.removeEventListener('mouseup', this._handleMouseUp);
            if (this.unhighilightTimer > -1) clearImmediate(this.unhighilightTimer);
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
     * @param {Immutable.Map<number, ProjectComponent>} components
     * @param {number} rootId
     * @param {number} enclosingComponentId
     * @return {Function}
     */
    _makeBuilder(components, rootId, enclosingComponentId) {
        const ret = ({ children }) => (
            <Builder
                components={components}
                rootId={rootId}
                enclosingComponentId={enclosingComponentId}
                children={children}
            />
        );

        ret.displayName = `Builder(${rootId === -1 ? 'null' : rootId})`;
        return ret;
    };

    /**
     *
     * @param {Object} routes
     * @param {number} routeId
     * @param {number} [enclosingComponentId=-1]
     * @return {Object}
     * @private
     */
    _createRoute(routes, routeId, enclosingComponentId = -1) {
        const route = routes.get(routeId);

        const ret = {
            path: route.path,
            component: this._makeBuilder(
                route.components,
                route.component,
                enclosingComponentId
            )
        };

        ret.onEnter = this._handleChangeRoute.bind(this, route.id, false);

        const outletId = getOutletComponentId(route);

        const enclosingComponentIdForChildRoute = outletId > -1
            ? getParentComponentId(route, outletId)
            : -1;

        if (route.children.size > 0) {
            ret.childRoutes = route.children
                .map(childRouteId => this._createRoute(
                    routes,
                    childRouteId,
                    enclosingComponentIdForChildRoute)
                )
                .toArray();
        }

        if (route.haveRedirect) {
            ret.onEnter = (_, replace) => replace(route.redirectTo);
        }
        else if (route.haveIndex) {
            ret.indexRoute = {
                component: this._makeBuilder(
                    route.components,
                    route.indexComponent,
                    enclosingComponentIdForChildRoute
                ),

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
     * @param {number} componentId
     * @return {boolean}
     * @private
     */
    _canInteractWithComponent(componentId) {
        // We can interact with any component in nested constructors
        if (this.props.topNestedConstructor) return true;

        // If we're not in nested constructor, check if component is in current route
        return this._componentIsInCurrentRoute(componentId);
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

        if (componentId > -1 && this._canInteractWithComponent(componentId)) {
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
        if (this.props.draggingComponent){
			event.stopPropagation();
			this.willTryStartDrag = false;
			this.props.onDropComponent(DROP_COMPONENT_AREA_IDS.PREVIEW);
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

            if (componentId > -1 && this._canInteractWithComponent(componentId)) {
                if (this.unhighilightTimer > -1) {
                    clearImmediate(this.unhighilightTimer);
                    this.unhighilightTimer = -1;
                }

                if (this.unhighlightedComponentId !== componentId) {
                    if (this.unhighlightedComponentId > -1)
                        this.props.onUnhighlightComponent(this.unhighlightedComponentId);

                    this.props.onHighlightComponent(componentId);
                }

                this.unhighlightedComponentId = -1;
            }
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
                else if (this._canInteractWithComponent(overWhat.componentId)) {
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

            if (componentId > -1 && this._canInteractWithComponent(componentId)) {
                if (this.unhighilightTimer > -1) {
                    clearImmediate(this.unhighilightTimer);
                    this.props.onUnhighlightComponent(this.unhighlightedComponentId);
                }

                this.unhighilightTimer = setImmediate(() => {
                    this.unhighilightTimer = -1;
                    this.unhighlightedComponentId = -1;
                    this.props.onUnhighlightComponent(componentId);
                });

                this.unhighlightedComponentId = componentId;
            }
        }
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleClick(event) {
        if (event.button === 0) {
            // Left button
            //noinspection JSCheckFunctionSignatures
            const componentId = getClosestComponentId(event.target);

            if (componentId > -1 && this._canInteractWithComponent(componentId)) {
                if (event.ctrlKey) this.props.onToggleComponentSelection(componentId);
                else this.props.onSelectSingleComponent(componentId);
            }
        }
    }

    render() {
        if (this.props.topNestedConstructor) {
            return (
                <Builder
                    components={this.props.topNestedConstructor.components}
                    rootId={this.props.topNestedConstructor.rootId}
                    ignoreOwnerProps
                />
            );
        }
        else {
            return (
                <Router
                    key={this.routerKey}
                    history={hashHistory}
                    routes={this.routes}
                />
            );
        }
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
    topNestedConstructor: PropTypes.any,

    onToggleComponentSelection: PropTypes.func,
    onSelectSingleComponent: PropTypes.func,
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

const mapStateToProps = (state) => ({
    project: state.project.data,
    meta: state.project.meta,
    draggingComponent: state.project.draggingComponent,
    highlightingEnabled: state.project.highlightingEnabled,
    currentRouteId: state.project.currentRouteId,
    currentRouteIsIndexRoute: state.project.currentRouteIsIndexRoute,
    topNestedConstructor: topNestedConstructorSelector(state)
});

const mapDispatchToProps = dispatch => ({
    onToggleComponentSelection: componentId =>
        void dispatch(toggleComponentSelection(componentId)),

    onSelectSingleComponent: componentId =>
        void dispatch(selectPreviewComponent(componentId, true)),

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
