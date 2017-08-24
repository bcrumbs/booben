import React, { PureComponent } from 'react';

import {
  CanvasStyled,
  calcBackgroundPosition,
  calcBackgroundSize,
} from './styles/CanvasStyled';

import { minMax } from '../../../utils/misc';

const SCALE_MIN = 0.5;
const SCALE_MAX = 2;
const SCALE_BASE = 1.25;

const on = (element, eventName, listener) =>
  element.addEventListener(eventName, listener);

const off = (element, eventName, listener) =>
  element.removeEventListener(eventName, listener);

export class DataFlowCanvas extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._rootElement = null;
    this._containerElement = null;

    this._offsetX = 0;
    this._offsetY = 0;
    this._scale = 1;

    this._moving = false;
    this._startX = 0;
    this._startY = 0;
    this._offsetStartX = 0;
    this._offsetStartY = 0;

    this._saveRef = this._saveRef.bind(this);
    this._saveContainerRef = this._saveContainerRef.bind(this);
    this._handleNativeMouseDown = this._handleNativeMouseDown.bind(this);
    this._handleNativeMouseMove = this._handleNativeMouseMove.bind(this);
    this._handleNativeMouseUp = this._handleNativeMouseUp.bind(this);
    this._handleNativeWheel = this._handleNativeWheel.bind(this);
  }

  componentDidMount() {
    on(this._rootElement, 'mousedown', this._handleNativeMouseDown);
    on(this._rootElement, 'wheel', this._handleNativeWheel);
  }

  componentWillUnmount() {
    off(this._rootElement, 'mousedown', this._handleNativeMouseDown);
    off(this._rootElement, 'wheel', this._handleNativeWheel);

    if (this._moving) {
      off(this._rootElement, 'mousemove', this._handleNativeMouseMove);
      off(this._rootElement, 'mouseup', this._handleNativeMouseUp);
    }
  }

  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _saveRef(ref) {
    this._rootElement = ref;
  }

  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _saveContainerRef(ref) {
    this._containerElement = ref;
  }

  /**
   *
   * @private
   */
  _updateContainerStyle() {
    const tx = `${this._offsetX}px`;
    const ty = `${this._offsetY}px`;
    const s = this._scale.toFixed(4);

    this._containerElement.style.transform =
      `translate(${tx}, ${ty}) scale(${s}, ${s})`;
  }

  _updateRootStyle() {
    this._rootElement.style['background-position'] =
      calcBackgroundPosition(this._offsetX, this._offsetY);

    this._rootElement.style['background-size'] =
      calcBackgroundSize(this._scale);
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleNativeMouseDown(event) {
    this._moving = true;
    this._startX = event.pageX;
    this._startY = event.pageY;
    this._offsetStartX = this._offsetX;
    this._offsetStartY = this._offsetY;

    on(this._rootElement, 'mousemove', this._handleNativeMouseMove);
    on(this._rootElement, 'mouseup', this._handleNativeMouseUp);
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleNativeMouseMove(event) {
    event.preventDefault();

    this._offsetX = this._offsetStartX + event.pageX - this._startX;
    this._offsetY = this._offsetStartY + event.pageY - this._startY;

    this._updateContainerStyle();
    this._updateRootStyle();
  }

  /**
   *
   * @param {WheelEvent} event
   * @private
   */
  _handleNativeWheel(event) {
    event.preventDefault();

    this._scale = minMax(
      this._scale * SCALE_BASE ** (-event.deltaY / 100),
      SCALE_MIN,
      SCALE_MAX,
    );

    this._updateContainerStyle();
    this._updateRootStyle();
  }

  /**
   *
   * @private
   */
  _handleNativeMouseUp() {
    this._moving = false;
    off(this._rootElement, 'mousemove', this._handleNativeMouseMove);
    off(this._rootElement, 'mouseup', this._handleNativeMouseUp);
  }

  render() {
    const { children } = this.props;

    return (
      <CanvasStyled innerRef={this._saveRef}>
        <div ref={this._saveContainerRef}>
          {children}
        </div>
      </CanvasStyled>
    );
  }
}

DataFlowCanvas.displayName = 'DataFlowCanvas';
