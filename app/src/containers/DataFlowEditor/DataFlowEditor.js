/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { MainRegion, Content } from '@reactackle/reactackle';

import {
  DataFlowWrapper,
  DataFlowCanvasWrapper,
  DataFlowCanvas,
  DataFlowArrow,
  DataFlowBlock,
  DataFlowBlockHeading,
  DataFlowBlockItem,
} from '../../components/dara-flow';

import {
  ToolBar,
  ToolBarGroup,
  ToolBarAction,
} from '../../components/ToolBar/ToolBar';

const propTypes = {};

const defaultProps = {};

const mapStateToProps = state => ({});

const wrap = connect(mapStateToProps);

class _DataFlowEditor extends PureComponent {
  render() {
    return (
      <MainRegion>
        <Content>
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
                text="100%"
                icon={{ name: 'caret-down' }}
                iconPositionRight
              />
            </ToolBarGroup>
          </ToolBar>

          <DataFlowWrapper>
            <DataFlowCanvasWrapper>
              <DataFlowCanvas>
                Hello world
              </DataFlowCanvas>
            </DataFlowCanvasWrapper>
          </DataFlowWrapper>
        </Content>
      </MainRegion>
    );
  }
}

_DataFlowEditor.propTypes = propTypes;
_DataFlowEditor.defaultProps = defaultProps;
_DataFlowEditor.displayName = 'DataFlowEditor';

export const DataFlowEditor = wrap(_DataFlowEditor);
