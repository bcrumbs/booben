import React from 'react';
import { Button } from '@reactackle/reactackle';

import {
  ToolBar,
  ToolBarGroup,
  ToolBarAction,
} from '../components/ToolBar/ToolBar';

import { DrawerTop } from '../components/DrawerTop/DrawerTop';

import {
  DrawerTopContent,
} from '../components/DrawerTopContent/DrawerTopContent';

import {
  DataFlowWrapper,
  DataFlowCanvas,
  DataFlowArrow,
} from '../components/dataFlow';

export const DataFlowScreen = () => (
  <DataFlowWrapper>
    <DrawerTop>
      <DrawerTopContent title="Data Flow Editor">
        <Button size="small" colorScheme="flatLight" text="Save & Close" />
        <Button size="small" colorScheme="flatLight" text="Dismiss & Close" />
      </DrawerTopContent>
    </DrawerTop>
    
    <ToolBar>
      <ToolBarGroup>
        <ToolBarAction icon={{ name: 'trash-o' }} />
      </ToolBarGroup>
      <ToolBarGroup>
        <ToolBarAction icon={{ name: 'undo' }} />
        <ToolBarAction icon={{ name: 'repeat' }} />
      </ToolBarGroup>
    </ToolBar>
    <DataFlowCanvas>
      DataFlow
      <DataFlowArrow
        start={{ x: 100, y: 116 }}
        end={{ x: 360, y: 456 }}
      />
      <DataFlowArrow
        start={{ x: 700, y: 116 }}
        end={{ x: 400, y: 456 }}
        colorScheme="string"
      />
      <DataFlowArrow
        start={{ x: 1000, y: 456 }}
        end={{ x: 700, y: 116 }}
        colorScheme="bool"
      />
    </DataFlowCanvas>
  </DataFlowWrapper>
);

DataFlowScreen.displayName = 'DataFlowScreen';
