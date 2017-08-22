import React from 'react';
import {
  Button,
  TextField,
  SelectBox,
} from '@reactackle/reactackle';

import {
  ToolBar,
  ToolBarGroup,
  ToolBarAction,
} from '../components/ToolBar/ToolBar';

import { Popover } from '../components/Popover/Popover';
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
  DataFlowCanvasWrapper,
  DataFlowCanvas,
  DataFlowArrow,
  DataFlowBlock,
  DataFlowBlockHeading,
  DataFlowBlockItem,

  NodeView,
  NodeGroup,
  PickView,
  TableView,
  GraphQLGroup,
  ArrayGroup,

  BlockSelectionMenu,
  BlockSelectionMenuGroup,
  BlockSelectionMenuItem,
} from '../components/dataFlow';

const BLOCK_WIDTH = 170;

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
      <ToolBarGroup>
        <ToolBarAction icon={{ name: 'search-minus' }} />
        <ToolBarAction icon={{ name: 'search-plus' }} />
        <ToolBarAction
          text='100%'
          icon={{ name: 'caret-down' }}
          iconPositionRight
        />
      </ToolBarGroup>
    </ToolBar>

    <DataFlowCanvasWrapper>
      <DataFlowCanvas>
        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={10}
          y={80}
        >
          <DataFlowBlock title="Value" outputType="string" >
            <DataFlowBlockItem>
              <TextField label="Value" dense />
            </DataFlowBlockItem>
          </DataFlowBlock>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={10}
          y={220}
        >
          <DataFlowBlock title="Value" outputType="default" />
        </TestPositionWrapper>

        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={250}
          y={100}
        >
          <DataFlowBlock title="Function" outputType="number">
            <DataFlowBlockHeading name="SomeFunction" />
            <NodeView
              title="Argument 1"
              subtitle="string"
              inputType="string"
            />
            <NodeView
              title="Argument 2"
              subtitle="bool"
              inputType="bool"
            />
          </DataFlowBlock>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={50}
          y={320}
        >
          <DataFlowBlock
            title="Component"
            outputType="bool"
          >
            <PickView title="Pick component" />
          </DataFlowBlock>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={50}
          y={480}
        >
          <DataFlowBlock
            title="Component"
            outputType="bool"
            actions={[
              { text: 'Clear' }
            ]}
          >
            <DataFlowBlockHeading
              title="Input"
              name="ComponentXYZ"
            />
            <TableView field="Disabled" tooltip="Field description" />
          </DataFlowBlock>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={470}
          y={100}
        >
          <DataFlowBlock title="Graph QL" outputType="string" disconnected>
            <DataFlowBlockHeading
              name="Planet Name"
              breadcrumbs={{
                items: [
                  { title: 'item1' },
                  { title: 'item2' },
                ],
                mode: 'dark',
              }}
            />
            <GraphQLGroup
              breadcrumbs={{
                items: [
                  { title: '/' },
                ],
                mode: 'dark',
              }}
              title="Field1"
            >
              <NodeView
                title="Argument 1"
                subtitle="string"
                inputType="complex"
                error
              />
            </GraphQLGroup>

            <GraphQLGroup
              breadcrumbs={{
                items: [
                  { title: 'field1' },
                  { title: 'field2' },
                ],
                mode: 'dark',
              }}
              title="Field2"
            >
              <NodeView
                title="Argument 2"
                subtitle="bool"
                inputType="bool"
                disconnected
              />
            </GraphQLGroup>
          </DataFlowBlock>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={250}
          y={480}
        >
          <DataFlowBlock
            title="Value"
            outputType="array"
          >
            <ArrayGroup>
              <NodeView removable title="1" />
              <NodeView removable title="2" />
              <NodeView removable title="3" />
            </ArrayGroup>
          </DataFlowBlock>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={450}
          y={480}
        >
          <DataFlowBlock
            title="Value"
            outputType="shape"
            typeDescription="description here.."
          >
            <NodeView title="Item-1" subtitle="shape">
              <NodeGroup>
                <NodeView title="Item-11" subtitle="string" inputType="string" />
                <NodeView title="Item-12" subtitle="shape" inputType="shape">
                  <NodeGroup>
                    <NodeView title="Item-111" subtitle="number" inputType="number" />
                  </NodeGroup>
                </NodeView>
                <NodeView
                  title="Item-13"
                  subtitle="shapeOf"
                  inputType="complex"
                  collapsed
                >
                  <NodeGroup>
                    <NodeView title="Item-111" subtitle="number" inputType="number" />
                  </NodeGroup>
                </NodeView>
              </NodeGroup>
            </NodeView>
          </DataFlowBlock>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={250}
          x={590}
          y={512}
        >
          <Popover title="ShapeOf">
            <div>Показываем Popover с описанием структуры типа при нажатии на стрелку</div>
            <pre>
              {
                `item1: {
                  item11: {},
                  item12: {},
                }`
              }
            </pre>
          </Popover>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={BLOCK_WIDTH}
          x={720}
          y={340}
        >
          <DataFlowBlock
            title="End"
            outputType="string"
            endPoint
          >
            <DataFlowBlockHeading
              title="Input"
              name="ComponentXYZ"
            />
            <TableView field="Disabled" tooltip="Field description" />
          </DataFlowBlock>
        </TestPositionWrapper>

        <TestPositionWrapper
          width={250}
          x={700}
          y={650}
        >
          <PanelCollapsible title="Blocks">
            <PanelCollapsibleItem>
              <SearchInput />
            </PanelCollapsibleItem>

            <PanelCollapsibleItem bordered hasPaddings>
              <BlockSelectionMenu>
                <BlockSelectionMenuGroup>
                  <BlockSelectionMenuItem title="Value" />
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
          start={{ x: 180, y: 104 }}
          end={{ x: 251, y: 199 }}
          colorScheme="string"
        />

        <DataFlowArrow
          start={{ x: 220, y: 339 }}
          end={{ x: 250, y: 242 }}
          colorScheme="bool"
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
    </DataFlowCanvasWrapper>
  </DataFlowWrapper>
);

DataFlowScreen.displayName = 'DataFlowScreen';
