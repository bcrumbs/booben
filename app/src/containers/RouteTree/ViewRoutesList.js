import React from 'react';

import {
  Tree,
  TreeList,
  TreeItem,
  TreeItemContent,
} from '../../components';

export const ViewRoutesList = props => {

  return (
    <Tree>
      <TreeList level={0}>
        <TreeItem>
          <TreeItemContent title=" 1" expanded hasSubLevel />
          <TreeList level={1}>
            <TreeItem>
              <TreeItemContent title="Index" />
            </TreeItem>
            <TreeItem>
              <TreeItemContent title=" 1-1" hasSubLevel />
            </TreeItem>
            <TreeItem>
              <TreeItemContent title=" 1-2" />
            </TreeItem>
          </TreeList>
        </TreeItem>
      </TreeList>
    </Tree>
  );
}

