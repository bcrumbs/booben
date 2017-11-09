/**
 * @author Dmitriy Bizyaev
 */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import _omit from 'lodash.omit';
import _forOwn from 'lodash.forown';
import { returnNull, isObject } from '../utils/misc';

const propTypes = {
  collapsedToPoint: PropTypes.bool,
};

const defaultProps = {
  collapsedToPoint: false,
};

const hocProps = Object.keys(propTypes);

export default ({
  pointAttributesFromProps = returnNull,
  getWindowInstance = () => window,
} = {}) => WrappedComponent => {
  const Wrapper = class extends Component {
    constructor(props, context) {
      super(props, context);
    
      this._pointElement = null;
      this._af = 0;
    
      this.state = {
        reallyCollapsed: false,
        pointX: 0,
        pointY: 0,
      };
      
      this._collapse = this._collapse.bind(this);
    }
    
    componentDidMount() {
      const { collapsedToPoint } = this.props;
      if (collapsedToPoint) {
        const windowInstance = getWindowInstance(this.props, this.context);
        this._af = windowInstance.requestAnimationFrame(this._collapse);
      }
    }
    
    componentWillReceiveProps(nextProps) {
      const { collapsedToPoint } = this.props;
      
      if (nextProps.collapsedToPoint) {
        if (!collapsedToPoint) {
          this._collapse();
        }
      } else if (collapsedToPoint) {
        this._uncollapse();
      }
    }
    
    componentWillUnmount() {
      this._removePoint();
      const windowInstance = getWindowInstance(this.props, this.context);
      if (this._af !== 0) windowInstance.cancelAnimationFrame(this._af);
    }
    
    _collapse() {
      const { reallyCollapsed } = this.state;
  
      if (!reallyCollapsed) {
        this._createPoint();
    
        this.setState({
          reallyCollapsed: true,
        });
      }
  
      this._af = 0;
    }
    
    _uncollapse() {
      const { reallyCollapsed } = this.state;
  
      if (reallyCollapsed) {
        this._removePoint();
    
        this.setState({
          reallyCollapsed: false,
        });
      }
    }
  
    _createPoint() {
      if (this._pointElement === null) {
        const element = findDOMNode(this);
        if (element) {
          const windowInstance = getWindowInstance(this.props, this.context);
          const { left, top } = element.getBoundingClientRect();
          
          const point = windowInstance.document.createElement('div');
          point.style.width = '0px';
          point.style.height = '0px';
          point.style.position = 'absolute';
          point.style.left = `${left}px`;
          point.style.top = `${top}px`;
  
          const attributes = pointAttributesFromProps(this.props);
          if (isObject(attributes)) {
            _forOwn(attributes, (value, key) => {
              point.setAttribute(key, value);
            });
          }
  
          windowInstance.document.body.appendChild(point);
          this._pointElement = point;
        }
      }
    }
    
    _removePoint() {
      if (this._pointElement !== null) {
        const windowInstance = getWindowInstance(this.props, this.context);
        windowInstance.document.body.removeChild(this._pointElement);
        this._pointElement = null;
      }
    }
  
    render() {
      const { reallyCollapsed } = this.state;
      
      if (reallyCollapsed) return null;
    
      return (
        <WrappedComponent {..._omit(this.props, hocProps)} />
      );
    }
  };
  
  Wrapper.propTypes = {
    ...(WrappedComponent.propTypes || {}),
    ...propTypes,
  };
  
  Wrapper.defaultProps = {
    ...(WrappedComponent.defaultProps || {}),
    ...defaultProps,
  };
  
  Wrapper.contextTypes = WrappedComponent.contextTypes;
  Wrapper.displayName = `collapsingToPoint(${WrappedComponent.displayName})`;
  
  return Wrapper;
};
