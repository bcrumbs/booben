'use strict';

import './ComponentsTree.scss';
import { ComponentsTreeList } from './ComponentsTreeList/ComponentsTreeList';

import React, { PropTypes } from 'react';

export const ComponentsTree = props => (
	<div className="components-tree">
	    <ComponentsTreeList>
	        {props.children}
	    </ComponentsTreeList>
	</div>
);

ComponentsTree.displayName = 'ComponentsTree';

export * from './ComponentsTreeList/ComponentsTreeList';
export * from './ComponentsTreeItem/ComponentsTreeItem';

