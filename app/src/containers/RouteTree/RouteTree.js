import React from 'react';
import { Button } from 'reactackle-button';

import {
  BlockContentBox,
  BlockContentViewButton,
  IconAdd,
} from '../../components';

import { ViewRouteTree } from './ViewRouteTree';
import { ViewRoutesList } from './ViewRoutesList';

const colorScheme = 'default';

const AddButton = props => (
  <Button
    radius="rounded"
    colorScheme="flatLight"
    icon={<IconAdd size="custom" color="currentColor" />}
    {...props}
  />
);

export const RouteTreeComponent = props => {
  const currentView = 'routesList';
  //const currentView = 'routeTree';

  const changeViewButtonProps = currentView === 'routesList'
    ? {
      title: 'Routes',
    }
    : {
      title: 'Route_title',
      sectionTitle: 'Route',
      actionsSlot: <AddButton />,
    };

  const content = currentView === 'routesList'
    ? <ViewRoutesList />
    : <ViewRouteTree />;

  return [
    <BlockContentViewButton
      key="change-view-button"
      colorScheme={colorScheme}
      {...changeViewButtonProps}
    />,

    <BlockContentBox key="list" colorScheme={colorScheme}>
      {content}
    </BlockContentBox>
  ];
}
