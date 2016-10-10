'use strict';

import './ComponentsTree.scss';

import React from 'react';

export const ComponentsTree = props => (
	<div className="components-tree">
		{props.children}
	</div>
);

ComponentsTree.displayName = 'ComponentsTree';

export * from './ComponentsTreeList/ComponentsTreeList';
export * from './ComponentsTreeItem/ComponentsTreeItem';
