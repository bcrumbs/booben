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

import {
    selectPreviewComponent,
    deselectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    showDndPreviewComponent,
    hideDndPreviewComponent
} from '../../app/actions/preview'

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

        this._handleMouseEvent = this._handleMouseEvent.bind(this);
        this._handleResize = this._handleResize.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleStartDrag = this._handleStartDrag.bind(this);
        this._handleStopDrag = this._handleStopDrag.bind(this);
    }

    componentDidMount() {
        this.domNode = ReactDOM.findDOMNode(this);
        this.domOverlay = this.props.domOverlay;

        if (this.props.interactive) {
            mouseEvents.forEach(e => {
                this.domNode.addEventListener(e, this._handleMouseEvent, false);
            });

            window.addEventListener('resize', this._handleResize, false);
        }
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

    _animateDnDComponent(dndParams) {
        var el = this.dndParams.el;

        if(dndParams) {
            el.style.left = `${dndParams.pageX}px`;
            el.style.top = `${dndParams.pageY}px`;
        } else {
            this.domOverlay.removeChild(el);
        }

    }

    _handleStartDrag(event) {
        if(this.dndFlag) return;

        this.domNode.addEventListener('mousemove', this._handleDrag);
        this.domNode.addEventListener('mouseup', this._handleStopDrag);
    }

    _handleStopDrag(event) {
        this.domNode.removeEventListener('mousemove', this._handleDrag);
        this.domNode.removeEventListener('mouseup', this._handleStopDrag);

        if(!this.dndFlag) return;

        const keys = Object.keys(event.target),
            riiKey = keys.find(key => key.startsWith('__reactInternalInstance$'));

        this.dndFlag = false;

        if (riiKey && this.dndParams) {
            const owner = getOwner(event.target[riiKey]._currentElement, item => item._currentElement.props.uid);

            console.log({
                source: this.dndParams.uid,
                target: owner._currentElement.props.uid
            });
        }

        this._animateDnDComponent(null);
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
            el.style.left = `${this.dndParams.dragStartX + 10}px`;
            el.style.top = `${this.dndParams.dragStartY + 10}px`;

            this.domOverlay.appendChild(el);
            this.dndFlag = true;
        }

        this._animateDnDComponent({
            pageX: event.pageX + 10,
            pageY: event.pageY + 10
        });
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
                this.dndParams.dragStartX = event.pageX;
                this.dndParams.dragStartY = event.pageY;

                this._handleStartDrag();
            }
        }
    }

    _createRoute(route) {
        const ret = {
            path: route.path,
            component: createBuilder(route.component)
        };

        if (route.children && route.children.size) {
            ret.childRoutes = route.children
                .map(child => this._createRoute(child))
                .toArray();
        }

        return ret;
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
    showDndComponent: PropTypes.func,
    hideDndComponent: PropTypes.func
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
