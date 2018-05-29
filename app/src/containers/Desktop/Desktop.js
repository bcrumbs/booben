import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { MainRegion } from 'reactackle-app';

import {
  ToolWindow,
  STICK_REGION_RIGHT,
  STICK_REGION_LEFT,
} from './ToolWindow/ToolWindow';

import { ToolPanel } from './ToolPanel/ToolPanel';
import ToolState from '../../models/ToolState';
import { Content } from '../../components';

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
  leftToolsPanelIsExpanded: PropTypes.bool.isRequired,
  rightToolsPanelIsExpanded: PropTypes.bool.isRequired,
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
  leftToolsPanelIsExpanded: desktop.leftToolsPanelIsExpanded,
  rightToolsPanelIsExpanded: desktop.rightToolsPanelIsExpanded,
});

const mapDispatchToProps = dispatch => ({
  onToolsPanelExpand: position =>
    void dispatch(expandToolsPanel(position)),

  onToolsPanelCollapse: position =>
    void dispatch(collapseToolsPanel(position)),

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

  onToolStickRegionEnter: (tool, position) =>
    void dispatch(setStickyTool(tool.id, position)),

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
          if (stickRegion === STICK_REGION_LEFT) {
            onToolStickRegionEnter(tool, 'left');
          }
            
          if (stickRegion === STICK_REGION_RIGHT) {
            onToolStickRegionEnter(tool, 'right');
          }
        };

        const onStickRegionLeave = stickRegion => {
          if (stickRegion === STICK_REGION_LEFT) onToolStickRegionLeave(tool);
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
            stickRegionLeft={DESKTOP_STICK_REGION_SIZE}
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
      leftToolsPanelIsExpanded,
      rightToolsPanelIsExpanded,
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
          isLeftExpanded={leftToolsPanelIsExpanded}
          isRightExpanded={rightToolsPanelIsExpanded}
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
