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
        this.avatarElement = null;
        this.posX = 0;
        this.posY = 0;
        this.needRAF = true;
        this.animationFrame = null;

        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleAnimationFrame = this._handleAnimationFrame.bind(this);

        if (props.draggingComponent) this._handleStartDrag();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.draggingComponent) {
            if (!this.dragging) this._handleStartDrag();
        }
        else {
            if (this.dragging) this._handleStopDrag();
        }
    }

    /**
     *
     * @returns {HTMLElement}
     * @private
     */
    _createAvatarElement() {
        const component = this.props.draggedComponents.get(
            this.props.draggedComponentId > -1 ? this.props.draggedComponentId : 0
        );

        const ret = document.createElement('div');
        ret.innerText = component.title || component.name;
        ret.style.position = 'absolute';
        ret.style.zIndex = 1001;
        return ret;
    }

    /**
     *
     * @private
     */
    _handleStartDrag() {
        window.addEventListener('mousemove', this._handleMouseMove);
        this.avatarElement = this._createAvatarElement();
        document.body.appendChild(this.avatarElement);
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

        document.body.removeChild(this.avatarElement);
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
    draggedComponentId: PropTypes.number,
    draggedComponents: PropTypes.any
};

ComponentsDragAreaComponent.displayName = 'ComponentsDragArea';

const mapStateToProps = ({ project }) => ({
    draggingComponent: project.draggingComponent,
    draggedComponentId: project.draggedComponentId,
    draggedComponents: project.draggedComponents
});

export const ComponentsDragArea = connect(
    mapStateToProps
)(ComponentsDragAreaComponent);
