/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  ComponentPlaceholder,
} from '../../components/ComponentPlaceholder/ComponentPlaceholder';

import { isDraggableComponent } from '../../hocs/draggable';
import { noop } from '../../utils/misc';

const propTypes = {
  onDrop: PropTypes.func,
};

const defaultProps = {
  onDrop: noop,
};

/**
 *
 * @type {number}
 */
const PLACEHOLDER_OFFSET_X = -50;
const PLACEHOLDER_OFFSET_Y = -50;
const PLACEHOLDER_WIDTH = 100;
const PLACEHOLDER_HEIGHT = 100;
const PLACEHOLDER_OPACITY = 1;

const linear = (from, to, x) => from + (to - from) * x;
const sine = (from, to, x) => from + (to - from) * Math.sin(x * Math.PI / 2);

let dragArea = null;

export class ComponentsDragArea extends PureComponent {
  constructor(props) {
    super(props);

    this._placeholderElement = null;
    this._dragging = false;
    this._positionX = 0;
    this._positionY = 0;
    this._width = 0;
    this._height = 0;
    this._opacity = 0;
    this._needRAF = true;
    this._animationFrame = null;
    this._tryingStartDrag = false;
    this._draggableElementBoundingRect = null;

    this.state = {
      title: '',
      data: null,
    };

    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleAnimationFrame = this._handleAnimationFrame.bind(this);
    this._saveRef = this._saveRef.bind(this);
  }

  componentDidMount() {
    dragArea = this;
  }

  componentWillUnmount() {
    this._cancelAnimationFrame();

    if (this._dragging) {
      window.removeEventListener('mousemove', this._handleMouseMove);
      window.removeEventListener('mouseup', this._handleMouseUp);
    }

    dragArea = null;
  }

  _saveRef(ref) {
    this._placeholderElement = ref;
  }

  _showPlaceholderElement() {
    this._placeholderElement.style.display = '';
  }

  _hidePlaceholderElement() {
    this._placeholderElement.style.display = 'none';
  }

  _handleAnimationFrame() {
    const style = this._placeholderElement.style;
    style.opacity = String(this._opacity);
    style.transform = `translate(${this._positionX}px, ${this._positionY}px)`;
    style.width = this._width > 0 ? `${this._width}px` : '';
    style.height = this._height > 0 ? `${this._height}px` : '';

    this._animationFrame = null;
    this._needRAF = true;
  }

  _scheduleAnimationFrame() {
    if (this._needRAF) {
      this._needRAF = false;

      this._animationFrame =
        window.requestAnimationFrame(this._handleAnimationFrame);
    }
  }
  
  _cancelAnimationFrame() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseMove(event) {
    this._positionX = event.pageX + PLACEHOLDER_OFFSET_X;
    this._positionY = event.pageY + PLACEHOLDER_OFFSET_Y;
    this._scheduleAnimationFrame();
  }
  
  /**
   *
   * @private
   */
  _handleMouseUp() {
    const { onDrop } = this.props;
    const { title, data } = this.state;

    this._dragging = false;
    this._cancelAnimationFrame();
    this._hidePlaceholderElement();

    window.removeEventListener('mousemove', this._handleMouseMove);
    window.removeEventListener('mouseup', this._handleMouseUp);

    onDrop({ title, data });
  }

  _handleDragTryStart({ title, data, element }) {
    this._tryingStartDrag = true;
    this._draggableElementBoundingRect = element.getBoundingClientRect();
    const { left, top, width, height } = this._draggableElementBoundingRect;

    this._positionX = left;
    this._positionY = top;
    this._width = width;
    this._height = height;
    this._opacity = 0;
    this._showPlaceholderElement();
    this._scheduleAnimationFrame();

    this.setState({ title, data });
  }

  _handleDragStartProgress({ pageX, pageY, progress }) {
    if (!this._tryingStartDrag) return;

    const { left, top, width, height } = this._draggableElementBoundingRect;
    const targetX = pageX + PLACEHOLDER_OFFSET_X;
    const targetY = pageY + PLACEHOLDER_OFFSET_Y;

    this._positionX = linear(left, targetX, progress);
    this._positionY = linear(top, targetY, progress);
    this._width = sine(width, PLACEHOLDER_WIDTH, progress);
    this._height = sine(height, PLACEHOLDER_HEIGHT, progress);
    this._opacity = sine(0, PLACEHOLDER_OPACITY, progress);
    this._scheduleAnimationFrame();
  }

  _handleDragStart({ pageX, pageY }) {
    if (!this._tryingStartDrag) return;

    this._tryingStartDrag = false;
    this._draggableElementBoundingRect = null;
    this._dragging = true;

    this._positionX = pageX + PLACEHOLDER_OFFSET_X;
    this._positionY = pageY + PLACEHOLDER_OFFSET_Y;
    this._width = PLACEHOLDER_WIDTH;
    this._height = PLACEHOLDER_HEIGHT;
    this._opacity = PLACEHOLDER_OPACITY;
    this._scheduleAnimationFrame();

    window.addEventListener('mousemove', this._handleMouseMove);
    window.addEventListener('mouseup', this._handleMouseUp);
  }

  _handleDragCancel() {
    if (!this._tryingStartDrag) return;

    this._tryingStartDrag = false;
    this._draggableElementBoundingRect = null;

    this._cancelAnimationFrame();
    this._hidePlaceholderElement();
  }

  render() {
    const { title } = this.state;

    const containerStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    };

    return (
      <div style={containerStyle}>
        <ComponentPlaceholder
          title={title}
          elementRef={this._saveRef}
        />
      </div>
    );
  }
}

ComponentsDragArea.propTypes = propTypes;
ComponentsDragArea.defaultProps = defaultProps;
ComponentsDragArea.displayName = 'ComponentsDragArea';


const handleDragTryStart = data => {
  if (dragArea !== null) dragArea._handleDragTryStart(data);
};

const handleDragStartProgress = data => {
  if (dragArea !== null) dragArea._handleDragStartProgress(data);
};

const handleDragStart = data => {
  if (dragArea !== null) dragArea._handleDragStart(data);
};

const handleDragCancel = data => {
  if (dragArea !== null) dragArea._handleDragCancel(data);
};

const wrapCallback = (cb, nextCb) => {
  if (!cb) return nextCb;

  return (...args) => {
    cb(...args);
    nextCb(...args);
  };
};

export const connectDraggable = WrappedComponent => {
  if (!isDraggableComponent(WrappedComponent)) return WrappedComponent;

  const ret = props => {
    const onDragTryStart =
      wrapCallback(props.onDragTryStart, handleDragTryStart);

    const onDragStartProgress =
      wrapCallback(props.onDragStartProgress, handleDragStartProgress);

    const onDragStart =
      wrapCallback(props.onDragStart, handleDragStart);

    const onDragCancel =
      wrapCallback(props.onDragCancel, handleDragCancel);

    return (
      <WrappedComponent
        {...props}
        onDragTryStart={onDragTryStart}
        onDragStartProgress={onDragStartProgress}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
      />
    );
  };

  ret.propTypes = WrappedComponent.propTypes;
  ret.defaultProps = WrappedComponent.defaultProps;
  ret.displayName = `connectDraggable(${WrappedComponent.displayName || ''})`;

  return ret;
};
