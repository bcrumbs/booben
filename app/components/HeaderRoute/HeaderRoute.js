// TODO: Figure out WTF is this

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
  Button,
  Header,
  HeaderRegion,
  HeaderTitle,
} from '@reactackle/reactackle';

import './HeaderRoute.scss';

const propTypes = {
  actions: PropTypes.bool,
  title: PropTypes.string,
};

const defaultProps = {
  actions: false,
  title: '',
};

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
    actions = (
      <HeaderRegion>
        <Button text="Cancel" light />
        <Button text="Save" light />
      </HeaderRegion>
    );
  }

  return (
    <div className="route-header-wrapper">
      <Header>
        <HeaderRegion spread alignY="center">
          <HeaderTitle>
            {props.title}
          </HeaderTitle>
        </HeaderRegion>
        {actions}
      </Header>
    </div>
  );
};

HeaderRoute.propTypes = propTypes;
HeaderRoute.defaultProps = defaultProps;
HeaderRoute.displayName = 'HeaderRoute';
