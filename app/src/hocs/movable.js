/**
 * @author Dmitriy Bizyaev
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash.omit';
import { on, off, stopPropagation } from '../utils/dom';

const propTypes = {
  positionX: PropTypes.number,
  positionY: PropTypes.number,
};

const defaultProps = {
  positionX: 0,
  positionY: 0,
};

export default WrappedComponent => {
  const MovableComponent = class extends Component {
    constructor(props, context) {
      super(props, context);
  
      this._rootElement = null;
      this._pickElement = null;
  
      this._positionX = props.positionX;
      this._positionY = props.positionY;
  
      this._moving = false;
      this._startX = 0;
      this._startY = 0;
      this._startPositionX = 0;
      this._startPositionY = 0;
      this._needRAF = false;
      this._animationFrameHandle = 0;
  
      this._saveRootRef = this._saveRootRef.bind(this);
      this._savePickRef = this._savePickRef.bind(this);
  
      this._animationFrame = this._animationFrame.bind(this);
  
      this._handleNativeMouseDown =
        this._handleNativeMouseDown.bind(this);
      this._handleNativeMouseMove =
        this._handleNativeMouseMove.bind(this);
      this._handleNativeMouseUp =
        this._handleNativeMouseUp.bind(this);
    }
  
    componentDidMount() {
      on(this._rootElement, 'mousedown', stopPropagation);
      on(this._pickElement, 'mousedown', this._handleNativeMouseDown);
    }
  
    componentWillUnmount() {
      off(this._rootElement, 'mousedown', stopPropagation);
      off(this._pickElement, 'mousedown', this._handleNativeMouseDown);
    
      if (this._animationFrameHandle !== 0) {
        this._cancelAnimationFrame();
      }
    
      if (this._moving) {
        off(window.document.body, 'mousemove', this._handleNativeMouseMove);
        off(window.document.body, 'mouseup', this._handleNativeMouseUp, true);
      }
    }
  
    _saveRootRef(ref) {
      this._rootElement = ref;
    }
  
    _savePickRef(ref) {
      this._pickElement = ref;
    }
  
    _formatTransformValue() {
      return `translate(${this._positionX}px, ${this._positionY}px)`;
    }
  
    _updatePosition() {
      this._rootElement.style.transform = this._formatTransformValue();
    }
  
    _animationFrame() {
      this._animationFrameHandle = 0;
      this._needRAF = true;
      this._updatePosition();
    }
  
    _scheduleUpdate() {
      this._animationFrameHandle =
        window.requestAnimationFrame(this._animationFrame);
    
      this._needRAF = false;
    }
  
    _cancelAnimationFrame() {
      window.cancelAnimationFrame(this._animationFrameHandle);
      this._animationFrameHandle = 0;
    }
  
    _handleNativeMouseDown(event) {
      event.stopPropagation();
    
      this._moving = true;
      this._startX = event.pageX;
      this._startY = event.pageY;
      this._startPositionX = this._positionX;
      this._startPositionY = this._positionY;
      this._needRAF = true;
    
      on(window.document.body, 'mousemove', this._handleNativeMouseMove);
      on(window.document.body, 'mouseup', this._handleNativeMouseUp, true);
    }
  
    _handleNativeMouseMove(event) {
      event.preventDefault();
    
      const dx = event.pageX - this._startX;
      const dy = event.pageY - this._startY;
    
      this._positionX = this._startPositionX + dx;
      this._positionY = this._startPositionY + dy;
    
      if (this._needRAF) {
        this._scheduleUpdate();
      }
    }
  
    _handleNativeMouseUp() {
      off(window.document.body, 'mousemove', this._handleNativeMouseMove);
      off(window.document.body, 'mouseup', this._handleNativeMouseUp, true);
    
      if (this._animationFrameHandle !== 0) {
        this._cancelAnimationFrame();
      }
    
      this._moving = false;
      this._needRAF = false;
    }
    
    render() {
      const props = omit(this.props, Object.keys(propTypes));
      
      return (
        <WrappedComponent
          {...props}
          rootRef={this._saveRootRef}
          pickRef={this._savePickRef}
          initialRootStyle={{ transform: this._formatTransformValue() }}
        />
      );
    }
  };
  
  MovableComponent.propTypes = { ...WrappedComponent.propTypes, ...propTypes };
  MovableComponent.defaultProps =
    { ...WrappedComponent.defaultProps, ...defaultProps };
  
  MovableComponent.displayName = `Movable(${WrappedComponent.displayName})`;
  
  return MovableComponent;
};
