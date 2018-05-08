import React from 'react';

import {
  IconRedirect,
  IconAdd,
  Tree,
  TreeList,
  TreeItem,
  TreeItemContent,
  ItemButton,
} from '../../components';

export const ViewRoutesList = props => {

  return (
    <Tree>
      <TreeList level={0}>
        <TreeItem>
          <TreeItemContent title="1" expanded hasSubLevel iconSlot={<IconRedirect />}/>
          <TreeList level={1}>
            <TreeItem>
              <TreeItemContent title="Index" />
            </TreeItem>
            <TreeItem>
              <TreeItemContent title="buttonSlotRight buttonSlotRight buttonSlotRightbuttonSlotRightbuttonSlotRight" hasSubLevel buttonSlotRight={<ItemButton icon={<IconAdd />} />}/>
            </TreeItem>
            <TreeItem>
              <TreeItemContent title="1-2" buttonSlotRight={<ItemButton icon={<IconAdd />} />}/>
            </TreeItem>
          </TreeList>
        </TreeItem>
      </TreeList>
    </Tree>
  );
}

