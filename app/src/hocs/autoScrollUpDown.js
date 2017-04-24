'use strict';

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import _omit from 'lodash.omit';

const propTypes = {
  fixedScrollingStep: PropTypes.number,
  scrollingStepTime: PropTypes.number,
  autoScrollUpDown: PropTypes.bool,
  additionalPixels: PropTypes.number,
  stepDiffDivider: PropTypes.number,
};

const defaultProps = {
  scrollingStepTime: 10,
  autoScrollUpDown: false,
  additionalPixels: 40,
  stepDiffDivider: 4,
};

const wrapperProps = Object.keys(propTypes);

const ScrollStates = {
  NONE: 0,
  UP: 1,
  DOWN: 2,
};

export const autoScrollUpDown = WrappedComponent => {
  const ret = class extends Component {
    constructor(props, context) {
      super(props, context);
      this._handleMouseMove = this._handleMouseMove.bind(this);
      this._scroll = this._scroll.bind(this);

      this.element = null;
      this.scrollInterval = null;
      this.scrollState = ScrollStates.NONE;
      this.scrollStep = 0;
      this.requestedFrameId = null;
      this.frameIsRequested = false;
    }
  
    componentDidMount() {
      document.addEventListener('mousemove', this._handleMouseMove);
      this.element = findDOMNode(this);
    }
  
    componentWillUnmount() {
      document.removeEventListener('mousemove', this._handleMouseMove);
      this._stopSteppingScroll();
    }
  
    _scroll() {
      const willScroll = this.element &&
        this.element.scrollTop >= 0 &&
        this.element.scrollTop <= this.element.scrollHeight;
      
      if (willScroll) {
        this.element.scrollTop +=
          this.props.fixedScrollingStep || this.scrollStep;
      }
      
      this.frameIsRequested = false;
    }
  
    _startSteppingScroll() {
      this.scrollInterval = setInterval(() => {
        if (this.frameIsRequested)
          cancelAnimationFrame(this.requestedFrameId);
        
        this.frameIsRequested = true;
        this.requestedFrameId = requestAnimationFrame(this._scroll);
      }, this.props.scrollingStepTime);
    }
  
    _stopSteppingScroll() {
      if (this.scrollInterval !== null) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    }
  
    _handleMouseMove(event) {
      if (
        !this.props.autoScrollUpDown ||
        !this.element.contains(event.target)
      ) {
        this._stopSteppingScroll();
        return;
      }
    
      const { top, bottom } = this.element.getBoundingClientRect();
      const { pageY } = event;
      const { additionalPixels } = this.props;
      const diff = Math.min(pageY - top, bottom - pageY);
      
      let scrollState = ScrollStates.NONE;
      if (diff < additionalPixels) {
        scrollState = ((top + bottom) / 2 < pageY)
          ? ScrollStates.DOWN
          : ScrollStates.UP;
      }

      const scrollStep =
        (scrollState === ScrollStates.DOWN ? 1 : -1) *
        (additionalPixels - diff) / this.props.stepDiffDivider | 0;

      if (this.scrollState === scrollState && this.scrollStep === scrollStep)
        return;

      this.scrollState = scrollState;
      this.scrollStep = scrollStep;
      
      if (this.scrollState === ScrollStates.NONE)
        this._stopSteppingScroll();
      else if (this.scrollInterval === null)
        this._startSteppingScroll();
    }
  
    render() {
      const wrappedComponentProps = _omit(this.props, wrapperProps);

      return (
        <WrappedComponent {...wrappedComponentProps} />
      );
    }
  };
  
  ret.displayName = `autoScrollUpDown(${WrappedComponent.displayName})`;
  ret.propTypes = { ...WrappedComponent.propTypes, ...propTypes };
  ret.defaultProps = { ...WrappedComponent.defaultProps, ...defaultProps };
  
  return ret;
};
