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

let justMountedCollapsedInstances = [];
let queuedInstances = [];
let afterMountTimeout = 0;
let working = false;
let currentPromise = null;
const doWork = async () => {
  for (let i = 0; i < justMountedCollapsedInstances.length; i++) {
    const instance = justMountedCollapsedInstances[i];
    if (instance._mounted) {
      await instance._initialRender();
      if (instance._mounted) {
        await instance._collapse();
      }
    }
  }

  justMountedCollapsedInstances = [];
  afterMountTimeout = 0;

  if (queuedInstances.length > 0) {
    justMountedCollapsedInstances = queuedInstances;
    queuedInstances = [];
    await doWork();
  }
};

const processMounted = async () => {
  working = true;
  await doWork();
  working = false;
  currentPromise = null;
};

const addInstance = instance => {
  if (working) {
    queuedInstances.push(instance);
  } else {
    justMountedCollapsedInstances.push(instance);
    if (afterMountTimeout === 0) {
      afterMountTimeout = setTimeout(() => {
        currentPromise = processMounted();
      }, 0);
    }
  }
};

export default ({
  pointAttributesFromProps = returnNull,
  getWindowInstance = () => window,
} = {}) => WrappedComponent => {
  const Wrapper = class extends Component {
    constructor(props, context) {
      super(props, context);

      this._pointElement = null;
      this._mounted = false;

      this.state = {
        pending: true,
        reallyCollapsed: false,
        pointX: 0,
        pointY: 0,
      };
    }

    componentDidMount() {
      const { collapsedToPoint } = this.props;

      this._mounted = true;

      if (collapsedToPoint) {
        addInstance(this);
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
      this._mounted = false;
    }

    async _initialRender() {
      return new Promise(resolve => {
        this.setState({ pending: false }, resolve);
      });
    }

    async _collapse() {
      const { reallyCollapsed } = this.state;

      if (!reallyCollapsed) {
        this._createPoint();
        return new Promise(resolve => {
          this.setState({
            reallyCollapsed: true,
            pending: false,
          }, resolve);
        });
      } else {
        return Promise.resolve();
      }
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
      const { pending, reallyCollapsed } = this.state;

      if (pending || reallyCollapsed) {
        return null;
      }

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
