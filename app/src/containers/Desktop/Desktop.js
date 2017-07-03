/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { MainRegion, Content } from '@reactackle/reactackle';
import { ToolWindow, STICK_REGION_RIGHT } from './ToolWindow/ToolWindow';
import { ToolPanel } from './ToolPanel/ToolPanel';
import ToolState from '../../models/ToolState';

import {
  expandToolsPanel,
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
import * as JssyPropTypes from '../../constants/common-prop-types';

import {
  DESKTOP_TOOL_WINDOWS_MARGIN,
  DESKTOP_EMPTY_TOOL_PANEL_WIDTH,
  DESKTOP_STICK_REGION_SIZE,
} from '../../config';

const propTypes = {
  toolGroups: JssyPropTypes.toolGroups,
  toolStates: JssyPropTypes.toolStates.isRequired,
  toolsPanelIsExpanded: PropTypes.bool.isRequired,
  onToolsPanelExpand: PropTypes.func.isRequired,
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

const defaultProps = {
  toolGroups: List(),
  onToolTitleChange: noop,
};

const mapStateToProps = ({ desktop }) => ({
  toolStates: desktop.toolStates,
  toolsPanelIsExpanded: desktop.toolsPanelIsExpanded,
});

const mapDispatchToProps = dispatch => ({
  onToolsPanelExpand: () =>
    void dispatch(expandToolsPanel()),

  onToolsPanelCollapse: () =>
    void dispatch(collapseToolsPanel()),

  onActiveToolChange: tool =>
    void dispatch(selectTool(tool.id)),

  onToolDock: tool =>
    void dispatch(dockTool(tool.id)),

  onToolUndock: (tool, nextActiveTool) =>
    void dispatch(undockTool(
      tool.id,
      nextActiveTool !== null ? nextActiveTool.id : null),
    ),

  onToolClose: tool =>
    void dispatch(closeTool(tool.id)),

  onToolFocus: tool =>
    void dispatch(focusTool(tool.id)),

  onToolStickRegionEnter: tool =>
    void dispatch(setStickyTool(tool.id)),

  onToolStickRegionLeave: () =>
    void dispatch(setStickyTool(null)),

  onToolActiveSectionChange: (tool, newActiveSection) =>
    void dispatch(setToolActiveSection(tool.id, newActiveSection)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

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
      ? DESKTOP_TOOL_WINDOWS_MARGIN
      : DESKTOP_TOOL_WINDOWS_MARGIN + DESKTOP_EMPTY_TOOL_PANEL_WIDTH;
    
    const windows = [];
  
    toolGroups.forEach(tools => {
      tools.forEach(tool => {
        const toolState = toolStates.get(tool.id) || new ToolState();
        
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
            marginBottom={DESKTOP_TOOL_WINDOWS_MARGIN}
            stickRegionRight={DESKTOP_STICK_REGION_SIZE}
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
      onToolsPanelExpand,
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
          onExpand={onToolsPanelExpand}
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

DesktopComponent.propTypes = propTypes;
DesktopComponent.defaultProps = defaultProps;
DesktopComponent.displayName = 'Desktop';

export const Desktop = wrap(DesktopComponent);
