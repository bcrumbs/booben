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

const breadcrumbsItems = [
	{
		title: 'ParentComponent'
	},
	{
		title: 'Content',
		isActive: true
	}
];

export const HeaderRoute = props => (
	<Header>
		<HeaderRegion spread alignY="center">
			<HeaderTitle>
				<Breadcrumbs items="breadcrumbsItems"/>
			</HeaderTitle>
		</HeaderRegion>
		<HeaderRegion>
			<Button text="Cancel"  light/>
			<Button text="OK"  light />
		</HeaderRegion>
	</Header>
);

HeaderRoute.displayName = 'HeaderRoute';


