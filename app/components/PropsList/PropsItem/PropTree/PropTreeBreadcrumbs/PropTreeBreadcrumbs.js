import React, { PropTypes } from 'react';

import { Breadcrumbs } from '@reactackle/reactackle';

const treeList = [
	{
		title: 'prop-1'
	},
	{
		title: 'buttons',
		isActive: true
	}
];

export const PropTreeBreadcrumbs = props => (
		<div className='prop-tree-breadcrumbs'>
			<Breadcrumbs items={treeList} mode="dark"/>
		</div>
	);

PropTreeBreadcrumbs.propTypes = {
};

PropTreeBreadcrumbs.defaultProps = {
};

PropTreeBreadcrumbs.displayName = 'PropTreeBreadcrumbs';
