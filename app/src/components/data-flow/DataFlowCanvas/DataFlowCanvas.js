import React, { PureComponent } from 'react';
import { CanvasStyled, calcBackgroundPosition } from './styles/CanvasStyled';
import { on, off } from '../../../utils/dom';
import { minMax } from '../../../utils/misc';

const SCALE_MIN = 0.5;
const SCALE_MAX = 2;
const SCALE_BASE = 1.25;

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
    
    this._animationFrameHandle = 0;
    this._needRAF = false;

    this._saveRef = this._saveRef.bind(this);
    this._saveContainerRef = this._saveContainerRef.bind(this);
    this._animationFrame = this._animationFrame.bind(this);
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
    if (this._animationFrameHandle !== 0) {
      this._cancelAnimationFrame();
    }
    
    off(this._rootElement, 'mousedown', this._handleNativeMouseDown);
    off(this._rootElement, 'wheel', this._handleNativeWheel);

    if (this._moving) {
      off(this._rootElement, 'mousemove', this._handleNativeMouseMove);
      off(window.document.body, 'mouseup', this._handleNativeMouseUp, true);
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
  _scheduleUpdate() {
    if (this._needRAF) {
      this._animationFrameHandle =
        window.requestAnimationFrame(this._animationFrame);
  
      this._needRAF = false;
    }
  }
  
  /**
   *
   * @private
   */
  _animationFrame() {
    this._animationFrameHandle = 0;
    this._needRAF = true;
    this._updateRootStyle();
    this._updateContainerStyle();
  }
  
  /**
   *
   * @private
   */
  _cancelAnimationFrame() {
    window.cancelAnimationFrame(this._animationFrameHandle);
    this._animationFrameHandle = 0;
  }

  /**
   *
   * @private
   */
  _updateContainerStyle() {
    const tx = `${this._offsetX}px`;
    const ty = `${this._offsetY}px`;
  
    // TODO: Scale content

    this._containerElement.style.transform =
      `translate(${tx}, ${ty}) scale(1, 1)`;
  }
  
  /**
   *
   * @private
   */
  _updateRootStyle() {
    this._rootElement.style['background-position'] =
      calcBackgroundPosition(this._offsetX, this._offsetY);
  
    // TODO: Scale background
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
    on(window.document.body, 'mouseup', this._handleNativeMouseUp, true);
    
    this._needRAF = true;
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
    
    this._scheduleUpdate();
  }

  /**
   *
   * @private
   */
  _handleNativeMouseUp() {
    this._moving = false;
    off(this._rootElement, 'mousemove', this._handleNativeMouseMove);
    off(window.document.body, 'mouseup', this._handleNativeMouseUp, true);
    
    if (this._animationFrameHandle) {
      this._cancelAnimationFrame();
    }
    
    this._needRAF = false;
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
  
    this._scheduleUpdate();
  }

  render() {
    const { children } = this.props;

    return (
      <CanvasStyled innerRef={this._saveRef}>
        <div
          style={{ position: 'relative', top: '0', left: '0' }}
          ref={this._saveContainerRef}
        >
          {children}
        </div>
      </CanvasStyled>
    );
  }
}

DataFlowCanvas.displayName = 'DataFlowCanvas';
