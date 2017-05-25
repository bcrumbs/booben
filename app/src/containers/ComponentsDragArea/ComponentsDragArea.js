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
  showDebugData: PropTypes.bool,
  onDrop: PropTypes.func,
};

const defaultProps = {
  showDebugData: false,
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
  
    this._placeholderElement = null;
    this._debugDataContainerElement = null;
    this._dropZones = new Map();
    this._dropZoneDimensionsCache = new Map();
    this._lastDraggedDropZoneId = '';
    this._dragging = false;
    this._snapElement = null;
    this._snapHideTitle = false;
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
    this._saveDebugDataContainerRef =
      this._saveDebugDataContainerRef.bind(this);
  }

  componentWillMount() {
    if (dragArea) {
      throw new Error('There should be only one ComponentsDragArea');
    }
  }

  componentDidMount() {
    dragArea = this;
    this._hidePlaceholderElement();
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
  
  _saveDebugDataContainerRef(ref) {
    this._debugDataContainerElement = ref;
  }

  _showPlaceholderElement() {
    this._placeholderElement.style.display = '';
    
    if (this._debugDataContainerElement) {
      this._debugDataContainerElement.style.display = 'block';
    }
  }

  _hidePlaceholderElement() {
    this._placeholderElement.style.display = 'none';
    
    if (this._debugDataContainerElement) {
      this._debugDataContainerElement.style.display = 'none';
    }
  }
  
  _updateDebugData() {
    const el = this._debugDataContainerElement;
    if (!el) return;
    
    const elX =
      el.getElementsByClassName('js-drag-area-debug-x')[0];
    const elY =
      el.getElementsByClassName('js-drag-area-debug-y')[0];
    const elWidth =
      el.getElementsByClassName('js-drag-area-debug-w')[0];
    const elHeight =
      el.getElementsByClassName('js-drag-area-debug-h')[0];
    const elDZId =
      el.getElementsByClassName('js-drag-area-debug-drop-zone-id')[0];
    const elDZs =
      el.getElementsByClassName('js-drag-area-debug-drop-zones')[0];
    const elSnap =
      el.getElementsByClassName('js-drag-area-debug-snapped')[0];
    
    elX.innerText = `X = ${this._positionX}`;
    elY.innerText = `Y = ${this._positionY}`;
    elWidth.innerText = `W = ${this._width}`;
    elHeight.innerText = `H = ${this._width}`;
    elDZId.innerText = `Drop zone id: ${this._lastDraggedDropZoneId || '-'}`;
    
    const dzsList = Array.from(this._dropZones.values())
      .map(dz => dz.id)
      .join(', ');
    
    elDZs.innerText = `Drop zones: ${dzsList}`;
    elSnap.innerText = `Snap: ${this._snapElement ? 'Yes' : 'No'}`;
  }

  _handleAnimationFrame() {
    const style = this._placeholderElement.style;
    const titleElement = this._placeholderElement
      .getElementsByClassName('js-component-placeholder-title')[0];

    if (titleElement) {
      const willHideTitle = !!this._snapElement && this._snapHideTitle;
      titleElement.style.opacity = willHideTitle ? '0' : '';
    }

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

  _scheduleUpdate() {
    this._updateDebugData();
    
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

  _getDropZoneDimensions(dropZoneId) {
    const cached = this._dropZoneDimensionsCache.get(dropZoneId);
    if (cached) return cached;

    const dropZone = this._dropZones.get(dropZoneId);
    const dimensions = dropZone.element.getBoundingClientRect();

    this._dropZoneDimensionsCache.set(dropZoneId, dimensions);
    return dimensions;
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
      this._scheduleUpdate();
    }

    let foundDropZone = false;

    // eslint-disable-next-line no-restricted-syntax
    for (const { id, onDrag, onEnter } of this._dropZones.values()) {
      const { left, top, width, height } = this._getDropZoneDimensions(id);
      const mouseIsInDropZone = pointIsInRect(
        event.pageX,
        event.pageY,
        left,
        top,
        width,
        height,
      );

      if (mouseIsInDropZone) {
        if (this._lastDraggedDropZoneId !== id) {
          if (this._lastDraggedDropZoneId) {
            const lastDropZone =
              this._dropZones.get(this._lastDraggedDropZoneId);

            if (lastDropZone) lastDropZone.onLeave();
          }

          onEnter();
        }

        onDrag({
          x: event.pageX - left,
          y: event.pageY - top,
          pageX: event.pageX,
          pageY: event.pageY,
        });

        this._lastDraggedDropZoneId = id;
        foundDropZone = true;
        break;
      }
    }

    if (!foundDropZone) {
      if (this._lastDraggedDropZoneId) {
        const lastDropZone =
          this._dropZones.get(this._lastDraggedDropZoneId);

        if (lastDropZone) lastDropZone.onLeave();
      }

      this._lastDraggedDropZoneId = '';
    }
    
    this._updateDebugData();
  }
  
  /**
   *
   * @private
   */
  _handleMouseUp() {
    const { onDrop } = this.props;
    const { data } = this.state;
    
    const dropZoneId = this._lastDraggedDropZoneId;

    this._dragging = false;
    this._unsnapping = false;
    this._transitionEnabled = false;
    this._lastDraggedDropZoneId = '';
    this._snapElement = null;
    this._cancelAnimationFrame();
    this._hidePlaceholderElement();

    window.removeEventListener('mousemove', this._handleMouseMove);
    window.removeEventListener('mouseup', this._handleMouseUp);

    if (dropZoneId) onDrop({ dropZoneId, data });

    this._dropZoneDimensionsCache.clear();
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
    this._scheduleUpdate();

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
    this._scheduleUpdate();
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
    this._scheduleUpdate();

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

  _handleDropZoneReady({ id, element, onDrag, onEnter, onLeave }) {
    this._dropZones.set(id, { id, element, onDrag, onEnter, onLeave });
  }

  _handleDropZoneRemove({ id }) {
    this._dropZones.delete(id);
  }

  _handleSnap({ dropZoneId, element, x, y, width, height, hideTitle }) {
    if (!this._dragging || element === this._snapElement) return;

    const dropZoneData = this._dropZones.get(dropZoneId);
    if (!dropZoneData) return;

    const dropZoneElementBoundingRect =
      dropZoneData.element.getBoundingClientRect();

    this._snapElement = element;
    this._snapHideTitle = hideTitle;
    this._unsnapping = false;
    this._positionX = dropZoneElementBoundingRect.left + x;
    this._positionY = dropZoneElementBoundingRect.top + y;
    this._width = width;
    this._height = height;
    this._transitionEnabled = true;
    this._scheduleUpdate();
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
    this._scheduleUpdate();
  }

  render() {
    const { showDebugData } = this.props;
    const { title } = this.state;

    const containerStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    };
    
    let debugDataContainer = null;
    if (showDebugData) {
      const debugContainerStyle = {
        position: 'absolute',
        zIndex: '1000',
        bottom: 0,
        left: 0,
        width: '400px',
        height: '225px',
        display: 'none',
      };
  
      debugDataContainer = (
        <div style={debugContainerStyle} ref={this._saveDebugDataContainerRef}>
          <div className="js-drag-area-debug-x" />
          <div className="js-drag-area-debug-y" />
          <div className="js-drag-area-debug-w" />
          <div className="js-drag-area-debug-h" />
          <div className="js-drag-area-debug-drop-zone-id" />
          <div className="js-drag-area-debug-drop-zones" />
          <div className="js-drag-area-debug-snapped" />
        </div>
      );
    }

    return (
      <div style={containerStyle}>
        <ComponentPlaceholder
          title={title}
          elementRef={this._saveRef}
        />
        
        {debugDataContainer}
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
