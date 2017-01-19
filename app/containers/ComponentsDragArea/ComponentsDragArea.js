/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { dropComponent, DropComponentAreas } from '../../actions/preview';

/**
 *
 * @type {number}
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
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleAnimationFrame = this._handleAnimationFrame.bind(this);

    if (props.draggingComponent) {
      this._handleStartDrag(
        props.draggedComponents,
        props.draggedComponentId,
      );
    }
  }

  componentDidMount() {
    window.addEventListener('mouseup', this._handleMouseUp);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.draggingComponent) {
      if (!this.dragging) {
        this._handleStartDrag(
          nextProps.draggedComponents,
          nextProps.draggedComponentId,
        );
      }
    } else if (this.dragging) {
      this._handleStopDrag();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this._handleMouseUp);
  }

  /**
   *
   * @param {Object} component
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
   * @param {Immutable.Map} draggedComponents
   * @param {number} draggedComponentId
   * @private
   */
  _handleStartDrag(draggedComponents, draggedComponentId) {
    window.addEventListener('mousemove', this._handleMouseMove);
    
    const componentId = draggedComponentId > -1 ? draggedComponentId : 0,
      component = draggedComponents.get(componentId);

    this.avatarElement = this._createAvatarElement(component);
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
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseUp(event) {
    if (this.props.draggingComponent) {
      event.stopPropagation();
      this.props.onDropComponent(DropComponentAreas.OUT);
    }
  }

  /**
   *
   * @private
   */
  _handleAnimationFrame() {
    this.avatarElement.style.transform =
      `translate(${this.posX}px, ${this.posY}px)`;
    
    this.animationFrame = null;
    this.needRAF = true;
  }

  render() {
    return null;
  }
}

//noinspection JSUnresolvedVariable
ComponentsDragAreaComponent.propTypes = {
  draggingComponent: PropTypes.bool.isRequired,
  draggedComponentId: PropTypes.number.isRequired,
  draggedComponents: PropTypes.any,
  onDropComponent: PropTypes.func.isRequired,
};

ComponentsDragAreaComponent.defaultProps = {
  draggedComponents: null,
};

ComponentsDragAreaComponent.displayName = 'ComponentsDragArea';

const mapStateToProps = ({ project }) => ({
  draggingComponent: project.draggingComponent,
  draggedComponentId: project.draggedComponentId,
  draggedComponents: project.draggedComponents,
});

const mapDispatchToProps = dispatch => ({
  onDropComponent: dropOnAreaId => dispatch(dropComponent(dropOnAreaId)),
});

export const ComponentsDragArea = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentsDragAreaComponent);
