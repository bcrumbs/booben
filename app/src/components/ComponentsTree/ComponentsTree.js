'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import './ComponentsTree.scss';

const propTypes = {
  createElementRef: PropTypes.func,
};

const defaultProps = {
  createElementRef: noop,
};

export const ComponentsTree = props => (
  <div className="components-tree" ref={props.createElementRef}>
    {props.children}
  </div>
);

ComponentsTree.propTypes = propTypes;
ComponentsTree.defaultProps = defaultProps;
ComponentsTree.displayName = 'ComponentsTree';

export * from './ComponentsTreeList/ComponentsTreeList';
export * from './ComponentsTreeItem/ComponentsTreeItem';
