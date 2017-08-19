import React from 'react';
import {
  Button,
} from '@reactackle/reactackle';

import {
  ToolBar,
  ToolBarGroup,
  ToolBarAction,
} from '../components/ToolBar/ToolBar';

import { DrawerTop } from '../components/DrawerTop/DrawerTop';
import { SearchInput } from '../components/SearchInput/SearchInput';

import {
  DrawerTopContent,
} from '../components/DrawerTopContent/DrawerTopContent';

import {
  MenuOverlapping,
  MenuOverlappingGroup,
  MenuOverlappingGroupItem,
} from '../components/MenuOverlapping/MenuOverlapping';

import {
  PanelCollapsible,
  PanelCollapsibleItem,
} from '../components/PanelCollapsible/PanelCollapsible';

import {
  DataFlowWrapper,
  DataFlowCanvas,
  DataFlowArrow,
  DataFlowBlock,
  DataFlowBlockItem,

  NodeView,
  PickView,

  BlockSelectionMenu,
  BlockSelectionMenuGroup,
  BlockSelectionMenuItem,
} from '../components/dataFlow';

const TestPositionWrapper = ({ x, y, width, children }) => (
  <div
    style={{
      position: 'absolute',
      top: y,
      left: x,
      width: width,
    }}
  >
    {children}
  </div>
);

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
      <TestPositionWrapper
        width={150}
        x={10}
        y={80}
      >
        <DataFlowBlock title="Constant" outputType="string">
          <DataFlowBlockItem>
            <NodeView
              title="some block item 1"
              subtitle="bool"
              inputType="none"
            />
          </DataFlowBlockItem>
          <DataFlowBlockItem>
            <PickView title="Pick component" />
          </DataFlowBlockItem>
        </DataFlowBlock>
      </TestPositionWrapper>

      <TestPositionWrapper
        width={150}
        x={250}
        y={100}
      >
        <DataFlowBlock title="Function" outputType="number">
          <DataFlowBlockItem>
            <NodeView
              title="Argument 1"
              subtitle="string"
              inputType="complex"
            />
          </DataFlowBlockItem>
          <DataFlowBlockItem>
            <NodeView
              title="Argument 2"
              subtitle="bool"
              inputType="bool"
            />
          </DataFlowBlockItem>
        </DataFlowBlock>
      </TestPositionWrapper>

      <TestPositionWrapper
        width={150}
        x={600}
        y={150}
      >
        <DataFlowBlock title="Constant" outputType="default" />
      </TestPositionWrapper>

      <TestPositionWrapper
        width={150}
        x={50}
        y={250}
      >
        <DataFlowBlock
          title="Constant"
          outputType="bool"
          actions={[
            { text: 'Clear' }
          ]}
        >
          some block
        </DataFlowBlock>
      </TestPositionWrapper>

      <TestPositionWrapper
        width={250}
        x={600}
        y={550}
      >
        <PanelCollapsible title="Blocks">
          <PanelCollapsibleItem>
            <SearchInput />
          </PanelCollapsibleItem>

          <PanelCollapsibleItem bordered hasPaddings>
            <BlockSelectionMenu>
              <BlockSelectionMenuGroup>
                <BlockSelectionMenuItem title="Constant" />
                <BlockSelectionMenuItem title="Function">
                  <BlockSelectionMenuGroup title="Reactackle funcs">
                    <BlockSelectionMenuItem title="Calc average" />
                  </BlockSelectionMenuGroup>
                  <BlockSelectionMenuGroup title="User funcs">
                    <BlockSelectionMenuItem title="Calc average" />
                  </BlockSelectionMenuGroup>
                </BlockSelectionMenuItem>
                <BlockSelectionMenuItem title="Graph QL" />
              </BlockSelectionMenuGroup>
            </BlockSelectionMenu>
          </PanelCollapsibleItem>
        </PanelCollapsible>
      </TestPositionWrapper>

      <DataFlowArrow
        start={{ x: 160, y: 106 }}
        end={{ x: 250, y: 126 }}
        colorScheme="string"
      />
      <DataFlowArrow
        start={{ x: 200, y: 276 }}
        end={{ x: 250, y: 126 }}
        colorScheme="bool"
      />

      <DataFlowArrow
        start={{ x: 1000, y: 456 }}
        end={{ x: 700, y: 116 }}
        colorScheme="bool"
      />

      <DataFlowArrow
        start={{ x: 700, y: 116 }}
        end={{ x: 400, y: 456 }}
        colorScheme="number"
      />

      <TestPositionWrapper
        x={750}
        y={179}
        width={200}
      >
        <MenuOverlapping>
          <MenuOverlappingGroup title="Blocks">
            <MenuOverlappingGroupItem title="String" />
            <MenuOverlappingGroupItem title="Route URL" />
            <MenuOverlappingGroupItem title="Get Name" />
          </MenuOverlappingGroup>
        </MenuOverlapping>
      </TestPositionWrapper>
    </DataFlowCanvas>
  </DataFlowWrapper>
);

DataFlowScreen.displayName = 'DataFlowScreen';
