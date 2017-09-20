/**
 * @author Dmitriy Bizyaev
 */

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
} from '../../components/data-flow';

import {
  ToolBar,
  ToolBarGroup,
  ToolBarAction,
} from '../../components/ToolBar/ToolBar';

import { dataFlowUpdateCurrentValue } from '../../actions/project';

const propTypes = {
  onUpdateCurrentValue: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {};

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  onUpdateCurrentValue: newValue =>
    void dispatch(dataFlowUpdateCurrentValue(newValue)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

class _DataFlowEditor extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      blocks: new Map(),
    };
  }
  
  _renderBlocks() {
  
  }
  
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
