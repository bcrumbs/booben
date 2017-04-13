/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Component } from 'react';

export const isClassComponent = component =>
  component.prototype && component.prototype.isReactComponent;

const functionToClass = component => {
  const ret = class extends Component {
    render() {
      return component(this.props);
    }
  };

  ret.propTypes = component.propTypes;
  ret.defaultProps = component.defaultProps;
  ret.displayName = component.displayName;

  return ret;
};

export const toClassComponent = component =>
  isClassComponent(component) ? component : functionToClass(component);
