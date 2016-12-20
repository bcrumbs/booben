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

export const HeaderRoute = props => {
    let actions = null;
    if (props.actions) {
        actions =
            <HeaderRegion>
                <Button text="Cancel"  light/>
                <Button text="Save"  light />
            </HeaderRegion>;
    }
    
    return(
        <div className="route-header-wrapper">
            <Header>
                <HeaderRegion spread alignY="center">
                    <HeaderTitle>
                        { props.title }
                    </HeaderTitle>
                </HeaderRegion>
                { actions }
            </Header>
        </div>
    )
};

HeaderRoute.displayName = 'HeaderRoute';


