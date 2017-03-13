/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { MainRegion, Content } from '@reactackle/reactackle';
import { ToolWindow, STICK_REGION_RIGHT } from './ToolWindow/ToolWindow';
import { ToolPanel } from './ToolPanel/ToolPanel';
import ToolType from '../../models/Tool';
import ToolStateType from '../../models/ToolState';

import {
  collapseToolsPanel,
  dockTool,
  undockTool,
  focusTool,
  selectTool,
  closeTool,
  setStickyTool,
  setToolActiveSection,
} from '../../actions/desktop';

import { noop } from '../../utils/misc';

const TOOL_WINDOWS_MARGIN = 8;
const EMPTY_TOOL_PANEL_WIDTH = 40;
const STICK_REGION_SIZE = 100;

class DesktopComponent extends PureComponent {
  _renderWindows() {
    const {
      toolGroups,
      toolStates,
      onToolDock,
      onToolClose,
      onToolFocus,
      onToolTitleChange,
      onToolStickRegionEnter,
      onToolStickRegionLeave,
      onToolActiveSectionChange,
    } = this.props;
    
    const hasDockedTools = toolGroups.some(tools => tools.some(tool => {
      const toolState = toolStates.get(tool.id);
      return toolState && toolState.docked;
    }));
  
    const marginRight = hasDockedTools
      ? TOOL_WINDOWS_MARGIN
      : TOOL_WINDOWS_MARGIN + EMPTY_TOOL_PANEL_WIDTH;
    
    const windows = [];
  
    toolGroups.forEach(tools => {
      tools.forEach(tool => {
        const toolState = toolStates.get(tool.id) || new ToolStateType();
        
        if (toolState.docked || toolState.closed) return;
      
        const onDock = () => onToolDock(tool);
        const onClose = () => onToolClose(tool);
        const onFocus = () => onToolFocus(tool);
        const onTitleChange = newTitle => onToolTitleChange(tool, newTitle);
        
        const onStickRegionEnter = stickRegion => {
          if (stickRegion === STICK_REGION_RIGHT) onToolStickRegionEnter(tool);
        };
        
        const onStickRegionLeave = stickRegion => {
          if (stickRegion === STICK_REGION_RIGHT) onToolStickRegionLeave(tool);
        };
      
        const onStopDrag = () => {
          const toolState = toolStates.get(tool.id);
          if (toolState.isInDockRegion) onToolDock(tool);
        };
      
        const onActiveSectionChange = newActiveSection =>
          onToolActiveSectionChange(tool, newActiveSection);
      
        windows.push(
          <ToolWindow
            key={tool.id}
            tool={tool}
            toolState={toolState}
            constrainPosition
            marginRight={marginRight}
            marginBottom={TOOL_WINDOWS_MARGIN}
            stickRegionRight={STICK_REGION_SIZE}
            onDock={onDock}
            onClose={onClose}
            onFocus={onFocus}
            onTitleChange={onTitleChange}
            onStickRegionEnter={onStickRegionEnter}
            onStickRegionLeave={onStickRegionLeave}
            onStopDrag={onStopDrag}
            onActiveSectionChange={onActiveSectionChange}
          />,
        );
      });
    });
    
    return windows;
  }
  
  render() {
    const {
      toolGroups,
      toolStates,
      toolsPanelIsExpanded,
      onToolUndock,
      onToolTitleChange,
      onToolActiveSectionChange,
      onToolsPanelCollapse,
      onActiveToolChange,
      children,
    } = this.props;

    const windows = this._renderWindows();

    return (
      <MainRegion>
        <Content>
          {children}
          {windows}
        </Content>

        <ToolPanel
          isExpanded={toolsPanelIsExpanded}
          toolGroups={toolGroups}
          toolStates={toolStates}
          onCollapse={onToolsPanelCollapse}
          onToolSelect={onActiveToolChange}
          onToolUndock={onToolUndock}
          onToolTitleChange={onToolTitleChange}
          onToolActiveSectionChange={onToolActiveSectionChange}
        />
      </MainRegion>
    );
  }
}

//noinspection JSUnresolvedVariable
DesktopComponent.propTypes = {
  toolGroups: ImmutablePropTypes.listOf(
    ImmutablePropTypes.listOf(PropTypes.instanceOf(ToolType)),
  ),
  toolStates: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ToolStateType),
    PropTypes.string,
  ).isRequired,
  toolsPanelIsExpanded: PropTypes.bool.isRequired,
  onToolsPanelCollapse: PropTypes.func.isRequired,
  onActiveToolChange: PropTypes.func.isRequired,
  onToolTitleChange: PropTypes.func,
  onToolDock: PropTypes.func.isRequired,
  onToolUndock: PropTypes.func.isRequired,
  onToolClose: PropTypes.func.isRequired,
  onToolFocus: PropTypes.func.isRequired,
  onToolStickRegionEnter: PropTypes.func.isRequired,
  onToolStickRegionLeave: PropTypes.func.isRequired,
  onToolActiveSectionChange: PropTypes.func.isRequired,
};

DesktopComponent.defaultProps = {
  toolGroups: List(),
  onToolTitleChange: noop,
};

DesktopComponent.displayName = 'Desktop';

const mapStateToProps = ({ desktop }) => ({
  toolStates: desktop.toolStates,
  toolsPanelIsExpanded: desktop.toolsPanelIsExpanded,
});

const mapDispatchToProps = dispatch => ({
  onToolsPanelCollapse: () => void dispatch(collapseToolsPanel()),
  onActiveToolChange: tool => void dispatch(selectTool(tool.id)),
  onToolDock: tool => void dispatch(dockTool(tool.id)),
  onToolUndock: (tool, nextActiveTool) => void dispatch(undockTool(
    tool.id,
    nextActiveTool !== null ? nextActiveTool.id : null),
  ),

  onToolClose: tool => void dispatch(closeTool(tool.id)),
  onToolFocus: tool => void dispatch(focusTool(tool.id)),
  onToolStickRegionEnter: tool => void dispatch(setStickyTool(tool.id)),
  onToolStickRegionLeave: () => void dispatch(setStickyTool(null)),
  onToolActiveSectionChange: (tool, newActiveSection) =>
    void dispatch(setToolActiveSection(tool.id, newActiveSection)),
});

export const Desktop = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DesktopComponent);
