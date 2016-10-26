/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 *
 * @type {number}
 * @const
 */
const OFFSET_DND_AVATAR = 10;

class ComponentsDragAreaComponent extends Component {
    constructor(props) {
        super(props);

        this.dragging = false;
        this.element = document.body;
        this.posX = 0;
        this.posY = 0;
        this.avatarElement = null;
        this.needRAF = true;
        this.animationFrame = null;

        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleAnimationFrame = this._handleAnimationFrame.bind(this);

        if (props.draggingComponent) this._handleStartDrag(props.draggedComponent);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.draggingComponent) {
            if (!this.dragging) this._handleStartDrag(nextProps.draggedComponent);
        }
        else {
            if (this.dragging) this._handleStopDrag();
        }
    }

    /**
     *
     * @param {ProjectComponent} component
     * @returns {HTMLElement}
     * @private
     */
    _createAvatarElement(component) {
        const ret = document.createElement('div');
        ret.innerText = component.title || component.name;
        ret.style.position = 'absolute';
        ret.style.zIndex = 1001;
        return ret;
    }

    /**
     *
     * @param {ProjectComponent} component
     * @private
     */
    _handleStartDrag(component) {
        window.addEventListener('mousemove', this._handleMouseMove);
        this.avatarElement = this._createAvatarElement(component);
        this.element.appendChild(this.avatarElement);
        this.dragging = true;
    }

    /**
     *
     * @private
     */
    _handleStopDrag() {
        window.removeEventListener('mousemove', this._handleMouseMove);

        if (this.animationFrame !== null) {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.element.removeChild(this.avatarElement);
        this.avatarElement = null;

        this.posX = 0;
        this.posY = 0;
        this.needRAF = true;
        this.dragging = false;
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseMove(event) {
        this.posX = event.pageX + OFFSET_DND_AVATAR;
        this.posY = event.pageY + OFFSET_DND_AVATAR;

        if (this.needRAF) {
            this.needRAF = false;

            this.animationFrame =
                window.requestAnimationFrame(this._handleAnimationFrame);
        }
    }

    /**
     *
     * @private
     */
    _handleAnimationFrame() {
        this.avatarElement.style.transform = `translate(${this.posX}px, ${this.posY}px)`;
        this.animationFrame = null;
        this.needRAF = true;
    }

    render() {
        return null;
    }
}

ComponentsDragAreaComponent.propTypes = {
    draggingComponent: PropTypes.bool,
    draggedComponent: PropTypes.any
};

ComponentsDragAreaComponent.displayName = 'ComponentsDragAreaComponent';

const mapStateToProps = state => ({
    draggingComponent: state.preview.draggingComponent,
    draggedComponent: state.preview.draggedComponent
});

export const ComponentsDragArea = connect(
    mapStateToProps
)(ComponentsDragAreaComponent);
