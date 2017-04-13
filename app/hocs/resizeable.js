/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { toClassComponent } from '../utils/react';

const propTypes = {
  resizeSides: PropTypes.arrayOf(PropTypes.oneOf([
    'top',
    'bottom',
    'left',
    'right',
  ])),
  resizeEnabled: PropTypes.bool,
  resizeArea: PropTypes.number,
  resizeMinWidth: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['original']),
  ]),
  resizeMaxWidth: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['original']),
  ]),
  resizeMinHeight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['original']),
  ]),
  resizeMaxHeight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['original']),
  ]),
};

const defaultProps = {
  resizeSides: [],
  resizeEnabled: true,
  resizeArea: 5,
  resizeMinWidth: 'original',
  resizeMaxWidth: 500,
  resizeMinHeight: 'original',
  resizeMaxHeight: 500,
};

const makeDisplayName = displayName => `resizeable(${displayName})`;

const setCursor = cursor => {
  window.document.body.style.setProperty = cursor;
};

const resetCursor = () => {
  window.document.body.style.cursor = '';
};

const wrap = OriginalComponent => class extends OriginalComponent {
  constructor(props) {
    super(props);

    this.__resizeableElement = null;
    this.__resizeableResizingLeft = false;
    this.__resizeableResizingRight = false;
    this.__resizeableResizingTop = false;
    this.__resizeableResizingBottom = false;
    this.__resizeableStartX = 0;
    this.__resizeableStartY = 0;
    this.__resizeableStartWidth = 0;
    this.__resizeableStartHeight = 0;
    this.__resizeableOriginalWidth = 0;
    this.__resizeableOriginalHeight = 0;
    this.__resizeableHovered = false;
    this.__resizeableNeedRAF = false;
    this.__resizeableAnimationFrame = null;
    this.__resizeableWillSetWidth = false;
    this.__resizeableWillSetHeight = false;
    this.__resizeableNewWidth = 0;
    this.__resizeableNewHeight = 0;

    this.__resizeableHandleMouseDown =
      this.__resizeableHandleMouseDown.bind(this);
    this.__resizeableHandleMouseUp =
      this.__resizeableHandleMouseUp.bind(this);
    this.__resizeableHandleMouseMove =
      this.__resizeableHandleMouseMove.bind(this);
    this.__resizeableHandleMouseEnter =
      this.__resizeableHandleMouseEnter.bind(this);
    this.__resizeableHandleMouseLeave =
      this.__resizeableHandleMouseLeave.bind(this);
    this.__resizeableHandleAnimationFrame =
      this.__resizeableHandleAnimationFrame.bind(this);
  }

  componentWillReceiveProps(...args) {
    if (super.componentWillReceiveProps)
      super.componentWillReceiveProps(...args);

    const nextProps = args[0];

    const { resizeEnabled } = this.props;

    if (this.__resizeableElement) {
      if (resizeEnabled && !nextProps.resizeEnabled) {
        this.__resizeableElement.style.width = '';
        this.__resizeableElement.style.height = '';
      }
    }
  }

  componentDidMount(...args) {
    if (super.componentDidMount) super.componentDidMount(...args);
    this.__resizeableUpdateElement();
  }

  componentDidUpdate(...args) {
    if (super.componentDidUpdate) super.componentDidUpdate(...args);
    this.__resizeableUpdateElement();
  }

  componentWillUnmount(...args) {
    if (super.componentWillUnmount) super.componentWillUnmount(...args);

    if (this.__resizeableElement) {
      this.__resizeableRemoveHandlers();
      this.__resizeableCancelAnimationFrame();
    }
  }

  __resizeableUpdateElement() {
    const newElement = findDOMNode(this);
    if (newElement !== this.__resizeableElement) {
      if (this.__resizeableElement) {
        this.__resizeableRemoveHandlers();
        this.__resizeableCancelAnimationFrame();
      }

      this.__resizeableResizingLeft = false;
      this.__resizeableResizingRight = false;
      this.__resizeableResizingTop = false;
      this.__resizeableResizingBottom = false;
      this.__resizeableElement = newElement;

      const { width, height } = newElement.getBoundingClientRect();
      this.__resizeableOriginalWidth = width;
      this.__resizeableOriginalHeight = height;
      this.__resizeableSetupHandlers();
    }
  }

  __resizeableIsResizing() {
    return this.__resizeableResizingLeft ||
      this.__resizeableResizingRight ||
      this.__resizeableResizingTop ||
      this.__resizeableResizingBottom;
  }

  __resizeableSetupHandlers() {
    if (!this.__resizeableElement) return;

    this.__resizeableElement.addEventListener(
      'mousedown',
      this.__resizeableHandleMouseDown,
    );

    this.__resizeableElement.addEventListener(
      'mouseenter',
      this.__resizeableHandleMouseEnter,
    );

    this.__resizeableElement.addEventListener(
      'mouseleave',
      this.__resizeableHandleMouseLeave,
    );

    window.addEventListener('mousemove', this.__resizeableHandleMouseMove);
  }

  __resizeableRemoveHandlers() {
    if (!this.__resizeableElement) return;

    this.__resizeableElement.removeEventListener(
      'mousedown',
      this.__resizeableHandleMouseDown,
    );

    this.__resizeableElement.removeEventListener(
      'mouseenter',
      this.__resizeableHandleMouseEnter,
    );

    this.__resizeableElement.removeEventListener(
      'mouseleave',
      this.__resizeableHandleMouseLeave,
    );

    window.removeEventListener('mousemove', this.__resizeableHandleMouseMove);

    if (this.__resizeableIsResizing())
      window.removeEventListener('mouseup', this.__resizeableHandleMouseUp);
  }

  __resizeableHandleMouseEnter() {
    this.__resizeableHovered = true;
  }

  __resizeableHandleMouseLeave() {
    this.__resizeableHovered = false;
    resetCursor();
  }

  __resizeableHandleMouseDown(event) {
    const { resizeEnabled, resizeSides, resizeArea } = this.props;

    if (!resizeEnabled) return;

    const { pageX, pageY, screenX, screenY } = event;
    const { left, top, width, height } =
      this.__resizeableElement.getBoundingClientRect();

    this.__resizeableResizingLeft =
      resizeSides.includes('left') &&
      pageX - left <= resizeArea;

    this.__resizeableResizingRight =
      !this.__resizeableResizingLeft &&
      resizeSides.includes('right') &&
      pageX - left >= width - resizeArea;

    this.__resizeableResizingTop =
      resizeSides.includes('top') &&
      pageY - top <= resizeArea;

    this.__resizeableResizingBottom =
      !this.__resizeableResizingTop &&
      resizeSides.includes('bottom') &&
      pageY - top >= height - resizeArea;

    if (this.__resizeableIsResizing()) {
      window.addEventListener('mouseup', this.__resizeableHandleMouseUp);
      this.__resizeableStartX = screenX;
      this.__resizeableStartY = screenY;
      this.__resizeableStartWidth = width;
      this.__resizeableStartHeight = height;
      this.__resizeableNeedRAF = true;
    }
  }

  __resizeableHandleMouseUp() {
    if (this.__resizeableIsResizing()) {
      window.removeEventListener('mouseup', this.__resizeableHandleMouseUp);
      this.__resizeableResizingLeft = false;
      this.__resizeableResizingRight = false;
      this.__resizeableResizingTop = false;
      this.__resizeableResizingBottom = false;

      this.__resizeableCancelAnimationFrame();
    }
  }

  __resizeableHandleMouseMove(event) {
    const { resizeEnabled } = this.props;

    if (!resizeEnabled) return;

    if (!this.__resizeableIsResizing()) {
      if (this.__resizeableHovered) {
        const { pageX, pageY } = event;
        this.__resizeableUpdateCursor(pageX, pageY);
      }
    } else {
      event.preventDefault();
      const { screenX, screenY } = event;
      this.__resizeableScheduleResize(screenX, screenY);
    }
  }

  __resizeableUpdateCursor(pageX, pageY) {
    const { resizeSides, resizeArea } = this.props;

    const { left, top, width, height } =
      this.__resizeableElement.getBoundingClientRect();

    const cursorLeft =
      resizeSides.includes('left') &&
      pageX <= left + resizeArea &&
      pageX >= left;

    const cursorRight =
      resizeSides.includes('right') &&
      pageX <= left + width &&
      pageX >= left + width - resizeArea;

    const cursorTop =
      resizeSides.includes('top') &&
      pageY <= top + resizeArea &&
      pageY >= top;

    const cursorBottom =
      resizeSides.includes('bottom') &&
      pageY <= top + height &&
      pageY >= top + height - resizeArea;

    let cursor = '';
    if (cursorTop) cursor += 'n';
    else if (cursorBottom) cursor += 's';
    if (cursorLeft) cursor += 'w';
    else if (cursorRight) cursor += 'e';

    if (cursor) setCursor(`${cursor}-resize`);
    else resetCursor();
  }

  __resizeableCalcActualLimits() {
    const {
      resizeMinWidth,
      resizeMaxWidth,
      resizeMinHeight,
      resizeMaxHeight,
    } = this.props;

    const actualMinWidth = resizeMinWidth === 'original'
      ? this.__resizeableOriginalWidth
      : resizeMinWidth;

    const actualMaxWidth = resizeMaxWidth === 'original'
      ? this.__resizeableOriginalWidth
      : resizeMaxWidth;

    const actualMinHeight = resizeMinHeight === 'original'
      ? this.__resizeableOriginalHeight
      : resizeMinHeight;

    const actualMaxHeight = resizeMaxHeight === 'original'
      ? this.__resizeableOriginalHeight
      : resizeMaxHeight;

    return {
      actualMinWidth,
      actualMaxWidth,
      actualMinHeight,
      actualMaxHeight,
    };
  }

  __resizeableTryRequestAnimationFrame() {
    const willRAF =
      this.__resizeableNeedRAF && (
        this.__resizeableWillSetWidth ||
        this.__resizeableWillSetHeight
      );

    if (willRAF) {
      this.__resizeableNeedRAF = false;
      this.__resizeableAnimationFrame =
        window.requestAnimationFrame(this.__resizeableHandleAnimationFrame);
    }
  }

  __resizeableCancelAnimationFrame() {
    if (this.__resizeableAnimationFrame !== null) {
      window.cancelAnimationFrame(this.__resizeableAnimationFrame);
      this.__resizeableAnimationFrame = null;
    }
  }

  __resizeableScheduleResize(screenX, screenY) {
    const { actualMinWidth, actualMaxWidth, actualMinHeight, actualMaxHeight } =
      this.__resizeableCalcActualLimits();

    let setWidth = false;
    let setHeight = false;
    let newWidth = 0;
    let newHeight = 0;

    if (this.__resizeableResizingLeft) {
      const maybeNewWidth =
        this.__resizeableStartWidth + (this.__resizeableStartX - screenX);

      setWidth = true;
      newWidth =
        Math.max(Math.min(maybeNewWidth, actualMaxWidth), actualMinWidth);
    } else if (this.__resizeableResizingRight) {
      const maybeNewWidth =
        this.__resizeableStartWidth + (screenX - this.__resizeableStartX);

      setWidth = true;
      newWidth =
        Math.max(Math.min(maybeNewWidth, actualMaxWidth), actualMinWidth);
    }

    if (this.__resizeableResizingTop) {
      const maybeNewHeight =
        this.__resizeableStartHeight + (this.__resizeableStartY - screenY);

      setHeight = true;
      newHeight =
        Math.max(Math.min(maybeNewHeight, actualMaxHeight), actualMinHeight);
    } else if (this.__resizeableResizingBottom) {
      const maybeNewHeight =
        this.__resizeableStartHeight + (screenY - this.__resizeableStartY);

      setHeight = true;
      newHeight =
        Math.max(Math.min(maybeNewHeight, actualMaxHeight), actualMinHeight);
    }

    this.__resizeableWillSetWidth = setWidth;
    this.__resizeableWillSetHeight = setHeight;
    this.__resizeableNewWidth = newWidth;
    this.__resizeableNewHeight = newHeight;

    this.__resizeableTryRequestAnimationFrame();
  }

  __resizeableHandleAnimationFrame() {
    if (this.__resizeableWillSetWidth)
      this.__resizeableElement.style.width = `${this.__resizeableNewWidth}px`;

    if (this.__resizeableWillSetHeight)
      this.__resizeableElement.style.height = `${this.__resizeableNewHeight}px`;

    this.__resizeableAnimationFrame = null;
    this.__resizeableNeedRAF = true;
  }
};

export default component => {
  const ret = wrap(toClassComponent(component));
  ret.propTypes = { ...component.propTypes, ...propTypes };
  ret.defaultProps = { ...component.defaultProps, ...defaultProps };
  ret.displayName = makeDisplayName(component.displayName);
  return ret;
};
