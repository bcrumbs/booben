/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import bezierEasing from 'bezier-easing';

import {
  ComponentPlaceholder,
} from '../../components/ComponentPlaceholder/ComponentPlaceholder';

import { isDraggableComponent } from '../../hocs/draggable';
import { isDropZoneComponent } from '../../hocs/dropZone';
import { noop, pointIsInRect } from '../../utils/misc';

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
const SNAP_TIME = 200;

const easeOut = bezierEasing(0, 0, 0.58, 1);
const easeInOut = bezierEasing(0.42, 0, 0.58, 1);

const interpolate = (from, to, x, easing) => from + (to - from) * easing(x);

let dragArea = null;

export class ComponentsDragArea extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._dropZones = new Map();
    this._placeholderElement = null;
    this._dragging = false;
    this._unsnapping = false;
    this._unsnapStartTime = 0;
    this._unsnapStartX = 0;
    this._unsnapStartY = 0;
    this._unsnapStartWidth = 0;
    this._unsnapStartHeight = 0;
    this._positionX = 0;
    this._positionY = 0;
    this._width = 0;
    this._height = 0;
    this._opacity = 0;
    this._transitionEnabled = false;
    this._snapElement = null;
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

  componentWillMount() {
    if (dragArea)
      throw new Error('There should be only one ComponentsDragArea');
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

    if (this._transitionEnabled) {
      style['transition-property'] = 'transform width height';
      style['transition-duration'] = `${SNAP_TIME}ms`;
      style['transition-timing-function'] = 'ease-out';
    } else {
      style['transition-property'] = '';
      style['transition-duration'] = '';
      style['transition-timing-function'] = '';
    }

    style.opacity = this._opacity.toFixed(3);

    if (this._unsnapping) {
      const progress = (Date.now() - this._unsnapStartTime) / SNAP_TIME;

      if (progress < 1) {
        const x = interpolate(
          this._unsnapStartX,
          this._positionX,
          progress,
          easeOut,
        );

        const y = interpolate(
          this._unsnapStartY,
          this._positionY,
          progress,
          easeOut,
        );

        const w = interpolate(
          this._unsnapStartWidth,
          PLACEHOLDER_WIDTH,
          progress,
          easeOut,
        );

        const h = interpolate(
          this._unsnapStartHeight,
          PLACEHOLDER_HEIGHT,
          progress,
          easeOut,
        );

        style.transform = `translate(${x}px, ${y}px)`;
        style.width = `${w}px`;
        style.height = `${h}px`;

        this._animationFrame =
          window.requestAnimationFrame(this._handleAnimationFrame);
      } else {
        this._unsnapping = false;

        style.transform =
          `translate(${this._positionX}px, ${this._positionY}px)`;

        style.width = this._width > 0 ? `${this._width}px` : '';
        style.height = this._height > 0 ? `${this._height}px` : '';
        this._animationFrame = null;
        this._needRAF = true;
      }
    } else {
      style.transform = `translate(${this._positionX}px, ${this._positionY}px)`;
      style.width = this._width > 0 ? `${this._width}px` : '';
      style.height = this._height > 0 ? `${this._height}px` : '';
      this._animationFrame = null;
      this._needRAF = true;
    }
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
    if (!this._snapElement) {
      this._positionX = event.pageX + PLACEHOLDER_OFFSET_X;
      this._positionY = event.pageY + PLACEHOLDER_OFFSET_Y;
      this._scheduleAnimationFrame();
    }

    this._dropZones.forEach(({ element, onDrag }) => {
      const { left, top, width, height } = element.getBoundingClientRect();

      if (pointIsInRect(event.clientX, event.clientY, left, top, width, height))
        onDrag({ x: event.clientX - left, y: event.clientY - top });
    });
  }
  
  /**
   *
   * @private
   */
  _handleMouseUp() {
    const { onDrop } = this.props;
    const { title, data } = this.state;

    this._dragging = false;
    this._unsnapping = false;
    this._transitionEnabled = false;
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

    this._positionX = interpolate(left, targetX, progress, easeInOut);
    this._positionY = interpolate(top, targetY, progress, easeInOut);
    this._width = interpolate(width, PLACEHOLDER_WIDTH, progress, easeInOut);
    this._height = interpolate(height, PLACEHOLDER_HEIGHT, progress, easeInOut);
    this._opacity = interpolate(0, PLACEHOLDER_OPACITY, progress, easeInOut);
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

  _handleDropZoneReady({ id, element, onDrag }) {
    this._dropZones.set(id, { id, element, onDrag });
  }

  _handleDropZoneRemove({ id }) {
    this._dropZones.delete(id);
  }

  _handleSnap({ dropZoneId, element, x, y, width, height }) {
    if (!this._dragging || element === this._snapElement) return;

    const dropZoneData = this._dropZones.get(dropZoneId);
    if (!dropZoneData) return;

    const dropZoneElementBoundingRect =
      dropZoneData.element.getBoundingClientRect();

    this._snapElement = element;
    this._unsnapping = false;
    this._positionX = dropZoneElementBoundingRect.left + x;
    this._positionY = dropZoneElementBoundingRect.top + y;
    this._width = width;
    this._height = height;
    this._transitionEnabled = true;
    this._scheduleAnimationFrame();
  }

  _handleUnsnap() {
    if (!this._dragging || !this._snapElement) return;

    this._snapElement = null;
    this._unsnapping = true;
    this._unsnapStartTime = Date.now();
    this._unsnapStartX = this._positionX;
    this._unsnapStartY = this._positionY;
    this._unsnapStartWidth = this._width;
    this._unsnapStartHeight = this._height;
    this._width = PLACEHOLDER_WIDTH;
    this._height = PLACEHOLDER_HEIGHT;
    this._transitionEnabled = false;
    this._scheduleAnimationFrame();
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

const handleDropZoneReady = data => {
  if (dragArea !== null) dragArea._handleDropZoneReady(data);
};

const handleDropZoneRemove = data => {
  if (dragArea !== null) dragArea._handleDropZoneRemove(data);
};

const handleSnap = data => {
  if (dragArea !== null) dragArea._handleSnap(data);
};

const handleUnsnap = data => {
  if (dragArea !== null) dragArea._handleUnsnap(data);
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

export const connectDropZone = WrappedComponent => {
  if (!isDropZoneComponent(WrappedComponent)) return WrappedComponent;

  const ret = props => {
    const onDropZoneSnap = wrapCallback(props.onDropZoneSnap, handleSnap);
    const onDropZoneUnsnap = wrapCallback(props.onDropZoneSnap, handleUnsnap);
    const onDropZoneReady =
      wrapCallback(props.onDropZoneReady, handleDropZoneReady);

    const onDropZoneRemove =
      wrapCallback(props.onDropZoneRemove, handleDropZoneRemove);

    return (
      <WrappedComponent
        {...props}
        onDropZoneReady={onDropZoneReady}
        onDropZoneRemove={onDropZoneRemove}
        onDropZoneSnap={onDropZoneSnap}
        onDropZoneUnsnap={onDropZoneUnsnap}
      />
    );
  };

  ret.propTypes = WrappedComponent.propTypes;
  ret.defaultProps = WrappedComponent.defaultProps;
  ret.displayName = `connectDropZone(${WrappedComponent.displayName || ''})`;

  return ret;
};
