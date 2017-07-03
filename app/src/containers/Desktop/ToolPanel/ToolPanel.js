/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';

import {
  PageDrawer,
  PageDrawerActionsArea,
  PageDrawerActionsGroup,
  PageDrawerActionItem,
  PageDrawerActionPlaceholder,
} from '@jssy/common-ui';

import { ToolPanelContent } from './ToolPanelContent/ToolPanelContent';
import resizeable from '../../../hocs/resizeable';
import ToolState from '../../../models/ToolState';
import { noop } from '../../../utils/misc';
import * as JssyPropTypes from '../../../constants/common-prop-types';
import { DESKTOP_PANEL_MIN_WIDTH } from '../../../config';

/* eslint-disable react/no-unused-prop-types */
const propTypes = {
  toolGroups: JssyPropTypes.toolGroups,
  toolStates: JssyPropTypes.toolStates,
  isExpanded: PropTypes.bool,
  onCollapse: PropTypes.func,
  onExpand: PropTypes.func,
  onToolUndock: PropTypes.func,
  onToolSelect: PropTypes.func,
  onToolTitleChange: PropTypes.func,
  onToolActiveSectionChange: PropTypes.func,
};
/* eslint-enable react/no-unused-prop-types */

const defaultProps = {
  toolGroups: List(),
  toolStates: Map(),
  isExpanded: false,
  onCollapse: noop,
  onExpand: noop,
  onToolUndock: noop,
  onToolSelect: noop,
  onToolTitleChange: noop,
  onToolActiveSectionChange: noop,
};

const ResizeablePageDrawer = resizeable(PageDrawer);

export const ToolPanel = props => {
  let activeTool = null;
  let shadowedTool = null;

  const panelSwitcherGroups = [];

  props.toolGroups.forEach((tools, groupIdx) => {
    const icons = [];

    tools.forEach(tool => {
      const toolState = props.toolStates.get(tool.id) || new ToolState();
      if (toolState.closed) return;

      if (toolState.isInDockRegion) {
        icons.push(
          <PageDrawerActionPlaceholder key={tool.id} />,
        );
      } else if (toolState.docked) {
        if (toolState.isActiveInToolsPanel) activeTool = tool;
        else if (toolState.isShadowedInToolsPanel) shadowedTool = tool;

        icons.push(
          <PageDrawerActionItem
            key={tool.id}
            icon={tool.icon}
            title={tool.name}
            isActive={toolState.isActiveInToolsPanel}
            onPress={() => props.onToolSelect(tool)}
          />,
        );
      }
    });

    if (icons.length > 0) {
      panelSwitcherGroups.push(
        <PageDrawerActionsGroup key={String(groupIdx)}>
          {icons}
        </PageDrawerActionsGroup>,
      );
    }
  });

  let panelContent = null;
  let shadowedPanelContent = null;
  let isExpanded = false;

  if (activeTool !== null) {
    const activeToolState =
      props.toolStates.get(activeTool.id) ||
      new ToolState();

    const onTitleChange = newTitle =>
      props.onToolTitleChange(activeTool, newTitle);

    const onUndock = () => {
      let nextActiveTool = null;

      /* eslint-disable consistent-return */
      props.toolGroups.forEach(tools => {
        tools.forEach(tool => {
          if (tool !== activeTool) {
            nextActiveTool = tool;
            return false;
          }
        });

        if (nextActiveTool !== null) return false;
      });
      /* eslint-enable consistent-return */

      props.onToolUndock(activeTool, nextActiveTool);
    };

    const onActiveSectionChange = ({ newActiveSection }) =>
      props.onToolActiveSectionChange(activeTool, newActiveSection);

    panelContent = (
      <ToolPanelContent
        key={`tool-panel-content-${activeTool.id}`}
        tool={activeTool}
        toolState={activeToolState}
        onTitleChange={onTitleChange}
        onUndock={onUndock}
        onActiveSectionChange={onActiveSectionChange}
        onCollapse={props.onCollapse}
      />
    );

    isExpanded = props.isExpanded;
  }

  if (shadowedTool !== null) {
    const shadowedToolState =
      props.toolStates.get(shadowedTool.id) ||
      new ToolState();

    shadowedPanelContent = (
      <ToolPanelContent
        key={`tool-panel-content-${shadowedTool.id}`}
        tool={shadowedTool}
        toolState={shadowedToolState}
        shadowed
      />
    );
  }
  
  const pageDrawerHasActions = panelSwitcherGroups.length > 0;
  if (!isExpanded && pageDrawerHasActions) {
    const expandActionGroup = (
      <PageDrawerActionsGroup key="expand">
        <PageDrawerActionItem
          icon="chevron-left"
          onPress={props.onExpand}
        />
      </PageDrawerActionsGroup>
    );
    
    panelSwitcherGroups.unshift(expandActionGroup);
  }

  return (
    <ResizeablePageDrawer
      resizeEnabled={isExpanded}
      resizeSides={['left']}
      resizeMinWidth={DESKTOP_PANEL_MIN_WIDTH}
      resizeMaxWidth={Math.round(window.innerWidth / 2)}
      isExpanded={isExpanded}
      hasActions={pageDrawerHasActions}
    >
      <PageDrawerActionsArea>
        {panelSwitcherGroups}
      </PageDrawerActionsArea>

      {shadowedPanelContent}
      {panelContent}
    </ResizeablePageDrawer>
  );
};

ToolPanel.propTypes = propTypes;
ToolPanel.defaultProps = defaultProps;
ToolPanel.displayName = 'ToolPanel';
