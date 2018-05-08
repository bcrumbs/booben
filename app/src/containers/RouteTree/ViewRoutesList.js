import React from 'react';

import {
  RouteTree,
  RouteTreeList,
  RouteTreeItem,
  RouteTreeItemContent,
} from '../../components';

export const ViewRoutesList = props => (
  <RouteTree>
    <RouteTreeList level={0}>
      <RouteTreeItem>
        <RouteTreeItemContent title="1" expanded hasSubLevel hasRedirect />
        <RouteTreeList level={1}>
          <RouteTreeItem>
            <RouteTreeItemContent hasSubLevel title="Index" />
          </RouteTreeItem>
          <RouteTreeItem>
            <RouteTreeItemContent title="buttonSlotRight buttonSlotRight buttonSlotRightbuttonSlotRightbuttonSlotRight" hasSubLevel />
          </RouteTreeItem>
          <RouteTreeItem>
            <RouteTreeItemContent title="1-2" />
          </RouteTreeItem>
        </RouteTreeList>
      </RouteTreeItem>
    </RouteTreeList>
  </RouteTree>
);

