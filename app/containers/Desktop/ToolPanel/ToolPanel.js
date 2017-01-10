/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Map } from 'immutable';

import {
  PageDrawer,
  PageDrawerActionsArea,
  PageDrawerActionsGroup,
  PageDrawerActionItem,
  PageDrawerActionPlaceholder,
} from '../../../components/PageDrawer/PageDrawer';

import { ToolPanelContent } from './ToolPanelContent/ToolPanelContent';
import ToolType from '../../../models/Tool';
import ToolStateType from '../../../models/ToolState';
import { noop } from '../../../utils/misc';

/* eslint-disable react/no-unused-prop-types */
const propTypes = {
  toolGroups: ImmutablePropTypes.listOf(
    ImmutablePropTypes.listOf(
      PropTypes.instanceOf(ToolType),
    ),
  ),
  toolStates: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ToolStateType),
    PropTypes.string,
  ),
  isExpanded: PropTypes.bool,
  onCollapse: PropTypes.func,
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
  onToolUndock: noop,
  onToolSelect: noop,
  onToolTitleChange: noop,
  onToolActiveSectionChange: noop,
};

export const ToolPanel = props => {
  let activeTool = null;

  const panelSwitcherGroups = [];

  props.toolGroups.forEach((tools, groupIdx) => {
    const icons = [];

    tools.forEach(tool => {
      const toolState = props.toolStates.get(tool.id) || new ToolStateType();
      if (toolState.closed) return;

      if (toolState.isInDockRegion) {
        icons.push(
          <PageDrawerActionPlaceholder key={tool.id} />,
        );
      } else if (toolState.docked) {
        if (toolState.isActiveInToolsPanel) activeTool = tool;

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

  let panelContent = null,
    isExpanded = false;

  if (activeTool !== null) {
    const activeToolState =
      props.toolStates.get(activeTool.id) ||
      new ToolStateType();

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

    const onActiveSectionChange = newActiveSection =>
      props.onToolActiveSectionChange(activeTool, newActiveSection);

    panelContent = (
      <ToolPanelContent
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

  return (
    <PageDrawer isExpanded={isExpanded}>
      <PageDrawerActionsArea>
        {panelSwitcherGroups}
      </PageDrawerActionsArea>

      {panelContent}
    </PageDrawer>
  );
};

ToolPanel.propTypes = propTypes;
ToolPanel.defaultProps = defaultProps;
ToolPanel.displayName = 'ToolPanel';
