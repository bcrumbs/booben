/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import bezierEasing from 'bezier-easing';
import pointInPolygon from 'point-in-polygon';
import Color from 'color';

import {
  ComponentsDragAreaContainer,
} from './styles/ComponentsDragAreaContainer';

import {
  ComponentPlaceholder,
} from '../../components/ComponentPlaceholder/ComponentPlaceholder';

import {
  MenuOverlapping,
  MenuOverlappingGroup,
  MenuOverlappingDivider,
  MenuOverlappingGroupItem,
} from '../../components/MenuOverlapping/MenuOverlapping';

import { isDraggableComponent } from '../../hocs/draggable';
import { isDropZoneComponent } from '../../hocs/dropZone';

import {
  startMouseSpeedMeasuring,
  stopMouseSpeedMeasuring,
  getMouseSpeed,
} from '../../utils/mouse-speed';

import {
  distance,
  tiltAngle,
  pointIsInRect,
  pointPositionRelativeToRect,
  PointPositions,
} from '../../utils/geometry';

import { noop, isDef } from '../../utils/misc';

import {
  DND_DROP_MENU_BORDER,
  DND_DROP_MENU_SHIFT_COEFFICIENT,
  DND_SNAP_TIME,
} from '../../config';

const propTypes = {
  onDrop: PropTypes.func,
};

const defaultProps = {
  onDrop: noop,
};

const RECTANGLE_WIDTH = 100;
const RECTANGLE_HEIGHT = 100;
const RECTANGLE_OFFSET_X = -Math.round(RECTANGLE_WIDTH / 2);
const RECTANGLE_OFFSET_Y = -Math.round(RECTANGLE_HEIGHT / 2);
const RECTANGLE_OPACITY = 1;

const SNAP_LINES_COLOR = '#2196F3';
const SNAP_LINES_OPACITY_START = 0.6;
const SNAP_LINES_OPACITY_END = 0;
const SNAP_LINES_LENGTH_COEFFICIENT = 0.5;

const linear = x => x;
const easeOut = bezierEasing(0, 0, 0.58, 1);
const easeInOut = bezierEasing(0.42, 0, 0.58, 1);

const interpolate = (from, to, x, easing) => from + (to - from) * easing(x);

/**
 *
 * @param {number} menuX
 * @param {number} menuY
 * @param {number} menuWidth
 * @param {number} menuHeight
 * @param {number} menuBorder
 * @param {number} snapX
 * @param {number} snapY
 * @return {number[][]}
 */
const buildDropMenuPolygon = (
  menuX,
  menuY,
  menuWidth,
  menuHeight,
  menuBorder,
  snapX,
  snapY,
) => {
  const actualX = menuX - menuBorder;
  const actualY = menuY - menuBorder;
  const actualWidth = menuWidth + menuBorder * 2;
  const actualHeight = menuHeight + menuBorder * 2;

  const nwPoint = [actualX, actualY];
  const nePoint = [actualX + actualWidth, actualY];
  const sePoint = [actualX + actualWidth, actualY + actualHeight];
  const swPoint = [actualX, actualY + actualHeight];

  const snapPoint = [snapX, snapY];

  const snapPointPosition = pointPositionRelativeToRect(
    snapX,
    snapY,
    actualX,
    actualY,
    actualWidth,
    actualHeight,
  );

  switch (snapPointPosition) {
    case PointPositions.NORTH_WEST: {
      return [snapPoint, nePoint, sePoint, swPoint];
    }

    case PointPositions.NORTH: {
      return [snapPoint, nePoint, sePoint, swPoint, nwPoint];
    }

    case PointPositions.NORTH_EAST: {
      return [snapPoint, sePoint, swPoint, nwPoint];
    }

    case PointPositions.EAST: {
      return [snapPoint, sePoint, swPoint, nwPoint, nePoint];
    }

    case PointPositions.SOUTH_EAST: {
      return [snapPoint, swPoint, nwPoint, nePoint];
    }

    case PointPositions.SOUTH: {
      return [snapPoint, swPoint, nwPoint, nePoint, sePoint];
    }

    case PointPositions.SOUTH_WEST: {
      return [snapPoint, nwPoint, nePoint, sePoint];
    }

    case PointPositions.WEST: {
      return [snapPoint, nwPoint, nePoint, sePoint, swPoint];
    }

    default: {
      return [nwPoint, nePoint, sePoint, swPoint];
    }
  }
};

/**
 *
 * @type {WeakMap<HTMLElement, ClientRect>}
 */
const elementDimensionsCache = new WeakMap();

/**
 *
 * @param {HTMLElement} element
 * @return {ClientRect}
 */
const getBoundingClientRectCached = element => {
  const cached = elementDimensionsCache.get(element);
  if (isDef(cached)) return cached;
  const rect = element.getBoundingClientRect();
  elementDimensionsCache.set(element, rect);
  return rect;
};

let dragArea = null;

export class ComponentsDragArea extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._containerElement = null;
    this._rectangleElement = null;
    this._rectangleTitleElement = null;
    this._snapLineElements = [];
    this._dropMenuElement = null;
    this._dropMenuItemElements = [];

    this._lastActiveDropMenuItem = -1;
    this._dropMenuPolygon = null;
    this._dropZones = new Map();
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
    this._snapPoints = null;
    this._positionX = 0;
    this._positionY = 0;
    this._width = 0;
    this._height = 0;
    this._opacity = 0;
    this._transitionEnabled = false;
    this._transitionStyleSet = false;
    this._animationFrame = 0;
    this._tryingStartDrag = false;
    this._draggableElementBoundingRect = null;
    this._localX = 0;
    this._localY = 0;

    this.state = {
      title: '',
      data: null,
      dropMenuDropZoneId: '',
      dropMenuIsVisible: false,
      dropMenuCoords: { x: 0, y: 0 },
      dropMenuSnapCoords: { x: 0, y: 0 },
      dropPointsData: [],
    };

    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleAnimationFrame = this._handleAnimationFrame.bind(this);
    this._handleDropMenuItemHover = this._handleDropMenuItemHover.bind(this);
    this._saveContainerRef = this._saveContainerRef.bind(this);
    this._saveRectangleRef = this._saveRectangleRef.bind(this);
    this._saveRectangleTitleRef = this._saveRectangleTitleRef.bind(this);
    this._saveDropMenuRef = this._saveDropMenuRef.bind(this);
  }

  componentWillMount() {
    if (dragArea) {
      throw new Error('There should be only one ComponentsDragArea');
    }
  }

  componentDidMount() {
    dragArea = this;
    this._hideRectangle();
  }

  componentWillUnmount() {
    this._cancelAnimationFrame();

    if (this._dragging) {
      window.removeEventListener('mousemove', this._handleMouseMove);
      window.removeEventListener('mouseup', this._handleMouseUp);
    }

    dragArea = null;
  }

  _saveContainerRef(ref) {
    this._containerElement = ref;
  }

  _saveRectangleRef(ref) {
    this._rectangleElement = ref;
  }

  _saveRectangleTitleRef(ref) {
    this._rectangleTitleElement = ref;
  }

  _saveDropMenuRef(ref) {
    this._dropMenuElement = ref;
  }

  _saveDropMenuItemRef(idx, ref) {
    this._dropMenuItemElements[idx] = ref;
  }

  _showRectangle() {
    this._rectangleElement.style.display = '';
  }

  _hideRectangle() {
    this._rectangleElement.style.display = 'none';
  }

  _handleAnimationFrame() {
    this._animationFrame = 0;

    if (this._rectangleTitleElement) {
      const willHideTitle = !!this._snapElement && this._snapHideTitle;
      this._rectangleTitleElement.style.opacity = willHideTitle ? '0' : '';
    }

    const style = this._rectangleElement.style;

    if (this._transitionEnabled) {
      if (!this._transitionStyleSet) {
        style['transition-property'] = 'transform width height';
        style['transition-duration'] = `${DND_SNAP_TIME}ms`;
        style['transition-timing-function'] = 'ease-out';
        this._transitionStyleSet = true;
      }
    } else if (this._transitionStyleSet) {
      style['transition-property'] = '';
      style['transition-duration'] = '';
      style['transition-timing-function'] = '';
      this._transitionStyleSet = false;
    }

    style.opacity = this._opacity.toFixed(3);

    if (this._unsnapping) {
      const progress = (Date.now() - this._unsnapStartTime) / DND_SNAP_TIME;

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
          RECTANGLE_WIDTH,
          progress,
          easeOut,
        );

        const h = interpolate(
          this._unsnapStartHeight,
          RECTANGLE_HEIGHT,
          progress,
          easeOut,
        );

        style.transform = `translate(${x}px, ${y}px)`;
        style.width = `${w}px`;
        style.height = `${h}px`;

        this._scheduleUpdate();
      } else {
        this._unsnapping = false;

        style.transform =
          `translate(${this._positionX}px, ${this._positionY}px)`;

        style.width = this._width > 0 ? `${this._width}px` : '';
        style.height = this._height > 0 ? `${this._height}px` : '';
      }
    } else {
      style.transform = `translate(${this._positionX}px, ${this._positionY}px)`;
      style.width = this._width > 0 ? `${this._width}px` : '';
      style.height = this._height > 0 ? `${this._height}px` : '';
    }

    if (this._snapPoints !== null) {
      const x = this._localX;
      const y = this._localY;
      this._snapPoints.forEach((snapPoint, idx) => {
        const dist = distance(x, y, snapPoint.x, snapPoint.y);
        const angle = tiltAngle(x, y, snapPoint.x, snapPoint.y);
        const snapLine = this._snapLineElements[idx];

        snapLine.style.width =
          `${Math.floor(dist * SNAP_LINES_LENGTH_COEFFICIENT)}px`;
        snapLine.style.transform = `rotate(${angle}rad)`;
      });
    }
  }

  _scheduleUpdate() {
    if (this._animationFrame === 0) {
      this._animationFrame =
        window.requestAnimationFrame(this._handleAnimationFrame);
    }
  }

  _cancelAnimationFrame() {
    if (this._animationFrame !== 0) {
      window.cancelAnimationFrame(this._animationFrame);
      this._animationFrame = 0;
    }
  }

  /**
   *
   * @param {string} dropZoneId
   * @return {ClientRect}
   * @private
   */
  _getDropZoneDimensions(dropZoneId) {
    const dropZone = this._dropZones.get(dropZoneId);
    return getBoundingClientRectCached(dropZone.element);
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseMove(event) {
    const { dropMenuIsVisible, dropMenuSnapCoords } = this.state;

    if (!this._snapElement) {
      this._positionX = event.pageX + RECTANGLE_OFFSET_X;
      this._positionY = event.pageY + RECTANGLE_OFFSET_Y;
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
        this._localX = event.pageX - left;
        this._localY = event.pageY - top;

        let dropZoneChanged = false;

        if (this._lastDraggedDropZoneId !== id) {
          dropZoneChanged = true;

          if (this._lastDraggedDropZoneId) {
            const lastDropZone =
              this._dropZones.get(this._lastDraggedDropZoneId);

            if (lastDropZone) {
              this._forgetSnapPoints();
              lastDropZone.onLeave();
            }
          }
        }

        if (!dropZoneChanged) {
          // Update snap lines
          this._scheduleUpdate();
        }

        let willTriggerDrag = true;

        if (dropMenuIsVisible) {
          if (dropZoneChanged) {
            this._hideDropMenu();
          } else {
            if (!this._dropMenuPolygon) {
              const dropMenuRect =
                getBoundingClientRectCached(this._dropMenuElement);

              this._dropMenuPolygon = buildDropMenuPolygon(
                dropMenuRect.left,
                dropMenuRect.top,
                dropMenuRect.width,
                dropMenuRect.height,
                DND_DROP_MENU_BORDER,
                dropMenuSnapCoords.x,
                dropMenuSnapCoords.y,
              );
            }

            const isOverDropMenu = pointInPolygon(
              [event.pageX, event.pageY],
              this._dropMenuPolygon,
            );

            if (isOverDropMenu) {
              willTriggerDrag = false;

              let activeDropMenuItem = -1;
              for (let i = 0; i < this._dropMenuItemElements.length; i++) {
                const element = this._dropMenuItemElements[i];
                const rect = getBoundingClientRectCached(element);
                const isOverItem = pointIsInRect(
                  event.clientX,
                  event.clientY,
                  rect.left,
                  rect.top,
                  rect.width,
                  rect.height,
                );

                if (isOverItem) {
                  activeDropMenuItem = i;
                  break;
                }
              }

              if (this._lastActiveDropMenuItem !== activeDropMenuItem) {
                if (activeDropMenuItem !== -1) {
                  this._selectDropPoint(activeDropMenuItem);
                }

                this._lastActiveDropMenuItem = activeDropMenuItem;
              }
            } else {
              this._hideDropMenu();
            }
          }
        }

        if (willTriggerDrag) {
          onDrag({
            x: event.pageX - left,
            y: event.pageY - top,
            pageX: event.pageX,
            pageY: event.pageY,
          });
        }

        this._lastDraggedDropZoneId = id;
        foundDropZone = true;
        if (dropZoneChanged) onEnter();
        break;
      }
    }

    if (!foundDropZone) {
      if (this._lastDraggedDropZoneId) {
        const lastDropZone =
          this._dropZones.get(this._lastDraggedDropZoneId);

        if (lastDropZone) {
          this._forgetSnapPoints();
          lastDropZone.onLeave();
        }
      }

      this._localX = 0;
      this._localY = 0;
      this._lastDraggedDropZoneId = '';
    }
  }

  /**
   *
   * @private
   */
  _handleMouseUp() {
    const { onDrop } = this.props;
    const { data, dropMenuIsVisible } = this.state;

    const dropZoneId = this._lastDraggedDropZoneId;

    this._dragging = false;
    this._unsnapping = false;
    this._transitionEnabled = false;
    this._lastDraggedDropZoneId = '';
    this._snapElement = null;
    this._cancelAnimationFrame();
    this._hideRectangle();

    window.removeEventListener('mousemove', this._handleMouseMove);
    window.removeEventListener('mouseup', this._handleMouseUp);
    stopMouseSpeedMeasuring();

    this._dropZones.forEach((dropZone, id) => {
      const thisDropZone = dropZoneId === id;
      dropZone.onDrop({ thisDropZone });
    });

    onDrop({ dropZoneId, data });

    if (dropMenuIsVisible) this._hideDropMenu();
    this._forgetSnapPoints();
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
    this._showRectangle();
    this._scheduleUpdate();

    this.setState({ title, data });
  }

  _handleDragStartProgress({ pageX, pageY, progress }) {
    if (!this._tryingStartDrag) return;

    const { left, top, width, height } = this._draggableElementBoundingRect;
    const targetX = pageX + RECTANGLE_OFFSET_X;
    const targetY = pageY + RECTANGLE_OFFSET_Y;

    this._positionX = interpolate(left, targetX, progress, linear);
    this._positionY = interpolate(top, targetY, progress, linear);
    this._width = interpolate(width, RECTANGLE_WIDTH, progress, easeInOut);
    this._height = interpolate(height, RECTANGLE_HEIGHT, progress, easeInOut);
    this._opacity = interpolate(0, RECTANGLE_OPACITY, progress, easeInOut);
    this._scheduleUpdate();
  }

  _handleDragStart({ pageX, pageY }) {
    if (!this._tryingStartDrag) return;

    this._tryingStartDrag = false;
    this._draggableElementBoundingRect = null;
    this._dragging = true;

    this._positionX = pageX + RECTANGLE_OFFSET_X;
    this._positionY = pageY + RECTANGLE_OFFSET_Y;
    this._width = RECTANGLE_WIDTH;
    this._height = RECTANGLE_HEIGHT;
    this._opacity = RECTANGLE_OPACITY;
    this._scheduleUpdate();

    window.addEventListener('mousemove', this._handleMouseMove);
    window.addEventListener('mouseup', this._handleMouseUp);
    startMouseSpeedMeasuring();
  }

  _handleDragCancel() {
    if (!this._tryingStartDrag) return;

    this._tryingStartDrag = false;
    this._draggableElementBoundingRect = null;

    this._cancelAnimationFrame();
    this._hideRectangle();
  }

  _handleDropZoneReady({
    id,
    element,
    onDrag = noop,
    onEnter = noop,
    onLeave = noop,
    onDropMenuItemSelected = noop,
    onDropMenuClosed = noop,
    onDrop = noop,
  }) {
    this._dropZones.set(id, {
      id,
      element,
      onDrag,
      onEnter,
      onLeave,
      onDropMenuItemSelected,
      onDropMenuClosed,
      onDrop,
    });
  }

  _handleDropZoneRemove({ id }) {
    if (this._lastDraggedDropZoneId === id) {
      this._forgetSnapPoints();
      this._lastDraggedDropZoneId = '';
    }

    this._dropZones.delete(id);
  }

  _handleSnap({ dropZoneId, element, x, y, width, height, hideTitle }) {
    if (!this._dragging) return;

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
    this._width = RECTANGLE_WIDTH;
    this._height = RECTANGLE_HEIGHT;
    this._transitionEnabled = false;
    this._scheduleUpdate();
  }

  _createSnapLines() {
    const x = this._localX;
    const y = this._localY;
    const { top, left } =
      this._getDropZoneDimensions(this._lastDraggedDropZoneId);

    const startColor =
      Color(SNAP_LINES_COLOR).fade(1 - SNAP_LINES_OPACITY_START);
    const endColor =
      Color(SNAP_LINES_COLOR).fade(1 - SNAP_LINES_OPACITY_END);

    this._snapLineElements = this._snapPoints.map(snapPoint => {
      const dist = distance(x, y, snapPoint.x, snapPoint.y);
      const angle = tiltAngle(x, y, snapPoint.x, snapPoint.y);
      const snapLine = window.document.createElement('div');

      snapLine.style.position = 'absolute';
      snapLine.style.zIndex = '50000';
      snapLine.style.top = `${top + snapPoint.y}px`;
      snapLine.style.left = `${left + snapPoint.x}px`;
      snapLine.style.width =
        `${Math.round(dist * SNAP_LINES_LENGTH_COEFFICIENT)}px`;
      snapLine.style.height = '1px';
      snapLine.style.transformOrigin = '0% 0%';
      snapLine.style.transform = `rotate(${angle}rad)`;
      snapLine.style.background =
        `linear-gradient(to right, ${startColor}, ${endColor})`;

      return snapLine;
    });

    this._snapLineElements.forEach(snapLine => {
      this._containerElement.appendChild(snapLine);
    });
  }

  _removeSnapLines() {
    this._snapLineElements.forEach(snapLine => {
      this._containerElement.removeChild(snapLine);
    });

    this._snapLineElements = [];
  }

  _hideSnapLines() {
    this._snapLineElements.forEach(snapLine => {
      snapLine.style.display = 'none';
    });
  }

  _showSnapLines() {
    this._snapLineElements.forEach(snapLine => {
      snapLine.style.display = 'block';
    });
  }

  _handleUpdateSnapPoints({ dropZoneId, snapPoints }) {
    if (!this._dragging) return;
    if (!this._dropZones.has(dropZoneId)) return;
    if (dropZoneId !== this._lastDraggedDropZoneId) return;

    this._forgetSnapPoints();
    this._snapPoints = snapPoints;
    this._createSnapLines();
  }

  _forgetSnapPoints() {
    if (this._snapPoints !== null) {
      this._snapPoints = null;
      this._removeSnapLines();
    }
  }

  _showDropMenu({ dropZoneId, coords, snapCoords, dropPointsData }) {
    if (
      !this._dragging ||
      !this._dropZones.has(dropZoneId) ||
      dropPointsData.length === 0
    ) {
      return;
    }

    this._hideSnapLines();

    const { left, top } = this._getDropZoneDimensions(dropZoneId);
    const mouseSpeed = getMouseSpeed();

    const menuX = Math.max(
      coords.x + left + mouseSpeed.x * DND_DROP_MENU_SHIFT_COEFFICIENT,
      0,
    );

    const menuY = Math.max(
      coords.y + top + mouseSpeed.y * DND_DROP_MENU_SHIFT_COEFFICIENT,
      0,
    );

    const snapX = snapCoords.x + left;
    const snapY = snapCoords.y + top;

    this._dropMenuItemElements = [];

    this.setState({
      dropMenuIsVisible: true,
      dropMenuDropZoneId: dropZoneId,
      dropMenuCoords: { x: menuX, y: menuY },
      dropMenuSnapCoords: { x: snapX, y: snapY },
      dropPointsData,
    });

    this._selectDropPoint(0);
  }

  _hideDropMenu() {
    const { dropMenuDropZoneId } = this.state;

    this._showSnapLines();

    const dropZone = this._dropZones.get(dropMenuDropZoneId);
    dropZone.onDropMenuClosed();

    this._dropMenuPolygon = null;

    this.setState({
      dropMenuIsVisible: false,
      dropMenuDropZoneId: '',
      dropMenuCoords: { x: 0, y: 0 },
      dropMenuSnapCoords: { x: 0, y: 0 },
      dropPointsData: [],
    });
  }

  _selectDropPoint(index) {
    const { dropMenuDropZoneId, dropPointsData } = this.state;

    const dropPointData = dropPointsData[index].data;
    const dropZone = this._dropZones.get(dropMenuDropZoneId);

    dropZone.onDropMenuItemSelected(dropPointData);
  }

  _handleDropMenuItemHover({ id }) {
    this._selectDropPoint(parseInt(id, 10));
  }

  _renderDropMenu() {
    const { dropMenuCoords: { x, y }, dropPointsData } = this.state;

    const style = {
      position: 'absolute',
      zIndex: '10000',
      left: `${x}px`,
      top: `${y}px`,
    };

    const items = dropPointsData.map(({ title, caption }, idx) => (
      <MenuOverlappingGroupItem
        key={String(idx)}
        id={String(idx)}
        title={title}
        caption={caption}
        elementRef={this._saveDropMenuItemRef.bind(this, idx)} // eslint-disable-line react/jsx-no-bind
      />
    ));

    return (
      <div style={style} ref={this._saveDropMenuRef}>
        <MenuOverlapping>
          <MenuOverlappingDivider title="Insert component into:" />

          <MenuOverlappingGroup>
            {items}
          </MenuOverlappingGroup>
        </MenuOverlapping>
      </div>
    );
  }

  render() {
    const { title, dropMenuIsVisible } = this.state;

    const dropMenu = dropMenuIsVisible ? this._renderDropMenu() : null;

    return createPortal(
      <ComponentsDragAreaContainer innerRef={this._saveContainerRef}>
        <ComponentPlaceholder
          title={title}
          elementRef={this._saveRectangleRef}
          titleElementRef={this._saveRectangleTitleRef}
        />

        {dropMenu}
      </ComponentsDragAreaContainer>,

      window.document.body,
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

const handleUpdateSnapPoints = data => {
  if (dragArea !== null) dragArea._handleUpdateSnapPoints(data);
};

const handleOpenDropMenu = data => {
  if (dragArea !== null) dragArea._showDropMenu(data);
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

    const onDropZoneOpenDropMenu =
      wrapCallback(props.onDropZoneOpenDropMenu, handleOpenDropMenu);

    const onDropZoneUpdateSnapPoints =
      wrapCallback(props.onDropZoneUpdateSnapPoints, handleUpdateSnapPoints);

    return (
      <WrappedComponent
        {...props}
        onDropZoneReady={onDropZoneReady}
        onDropZoneRemove={onDropZoneRemove}
        onDropZoneSnap={onDropZoneSnap}
        onDropZoneUnsnap={onDropZoneUnsnap}
        onDropZoneUpdateSnapPoints={onDropZoneUpdateSnapPoints}
        onDropZoneOpenDropMenu={onDropZoneOpenDropMenu}
      />
    );
  };

  ret.propTypes = WrappedComponent.propTypes;
  ret.defaultProps = WrappedComponent.defaultProps;
  ret.displayName = `connectDropZone(${WrappedComponent.displayName || ''})`;

  return ret;
};
