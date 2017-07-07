'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import { ComponentsTreeStyled } from './styles/ComponentsTreeStyled';

const propTypes = {
  createElementRef: PropTypes.func,
};

const defaultProps = {
  createElementRef: noop,
};

export const ComponentsTree = props => (
  <ComponentsTreeStyled innerRef={props.createElementRef}>
    {props.children}
  </ComponentsTreeStyled>
);

ComponentsTree.propTypes = propTypes;
ComponentsTree.defaultProps = defaultProps;
ComponentsTree.displayName = 'ComponentsTree';

export * from './ComponentsTreeList/ComponentsTreeList';
export * from './ComponentsTreeItem/ComponentsTreeItem';
export * from './ComponentsTreeCursor/ComponentsTreeCursor';
