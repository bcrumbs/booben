'use strict';
import React from 'react';
import {
	Button,
	Header,
	HeaderRegion,
	HeaderTitle,
	Breadcrumbs
} from '@reactackle/reactackle';

import './HeaderRoute.scss';

const breadcrumbsItemsList = [
	{
		title: 'ParentComponent'
	},
	{
		title: 'SomeChildComponent',
		isActive: true
	}
];

/*
	If structure's more than 1 level deep, place Breadcrumbs into HeaderTitle
	Ex:
	 <HeaderTitle>
	    <Breadcrumbs items={breadcrumbsItemsList} />
	 </HeaderTitle>
*/

export const HeaderRoute = props => (
	<Header>
		<HeaderRegion spread alignY="center">
			<HeaderTitle>
				ParentComponentTitle
			</HeaderTitle>
		</HeaderRegion>
		<HeaderRegion>
			<Button text="Cancel"  light/>
			<Button text="Save"  light />
		</HeaderRegion>
	</Header>
);

HeaderRoute.displayName = 'HeaderRoute';


