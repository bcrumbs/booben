import React, { PropTypes } from 'react';

import { Breadcrumbs } from '@reactackle/reactackle';

const treeList = [
	{
		title: 'prop-1',
		subtitle: 'object'
	},
	{
		title: 'buttons',
		subtitle: 'array',
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
