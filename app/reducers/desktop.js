/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Map, Record } from 'immutable';

import {
  DESKTOP_SET_TOOLS,
  DESKTOP_COLLAPSE_TOOLS_PANEL,
  DESKTOP_EXPAND_TOOLS_PANEL,
  DESKTOP_TOOL_DOCK,
  DESKTOP_TOOL_UNDOCK,
  DESKTOP_TOOL_FOCUS,
  DESKTOP_TOOL_SELECT,
  DESKTOP_TOOL_CLOSE,
  DESKTOP_TOOL_OPEN,
  DESKTOP_SET_STICKY_TOOL,
  DESKTOP_TOOL_SET_ACTIVE_SECTION,
  TOOL_ID_COMPONENTS_TREE,
} from '../actions/desktop';

import {
  PREVIEW_START_DRAG_NEW_COMPONENT,
  PREVIEW_START_DRAG_EXISTING_COMPONENT,
  PREVIEW_DROP_COMPONENT,
  DROP_COMPONENT_AREA_IDS,
} from '../actions/preview';

import ToolStateRecord from '../models/ToolState';

const DesktopState = Record({
  toolStates: Map(),
  toolsPanelIsExpanded: true,
  activeToolId: null,
  topToolZIndex: 0,
  stickyToolId: null,
  previousActiveToolId: null,
});

const selectTool = (state, toolId) => {
  if (toolId === state.activeToolId && state.toolsPanelIsExpanded) return state;

  if (state.activeToolId !== null) {
    state = state.setIn(
      ['toolStates', state.activeToolId, 'isActiveInToolsPanel'],
      false,
    );
  }

  if (toolId !== null && state.toolStates.has(toolId)) {
    return state
      .setIn(['toolStates', toolId, 'isActiveInToolsPanel'], true)
      .merge({
        activeToolId: toolId,
        toolsPanelIsExpanded: true,
      });
  } else {
    return state.set('activeToolId', null);
  }
};

const changeToolStateProp = (state, toolId, prop, value) =>
  state.toolStates.has(toolId)
    ? state.setIn(['toolStates', toolId, prop], value)
    : state;

const setNecessaryToolActiveAfterDragStart = state => {
  state = state.set('previousActiveToolId', state.activeToolId);
  
  const willSelectComponentsTree =
    state.activeToolId !== TOOL_ID_COMPONENTS_TREE &&
    state.toolStates.get(TOOL_ID_COMPONENTS_TREE).docked;
  
  return willSelectComponentsTree
    ? selectTool(state, TOOL_ID_COMPONENTS_TREE)
    : state;
};

const setNecessaryToolActiveAfterDrop = (state, dropOnAreaId) => {
  const willSelectPreviousTool =
    state.previousActiveToolId !== TOOL_ID_COMPONENTS_TREE &&
    state.toolStates.get(TOOL_ID_COMPONENTS_TREE).docked &&
    dropOnAreaId !== DROP_COMPONENT_AREA_IDS.TREE;
  
  if (willSelectPreviousTool)
    state = selectTool(state, state.previousActiveToolId);
  
  return state.set('previousActiveToolId', null);
};

export default (state = new DesktopState(), action) => {
  switch (action.type) {
    case DESKTOP_SET_TOOLS: {
      const newToolStates = {};

      action.toolIds.forEach(toolId => {
        if (!state.toolStates.has(toolId))
          newToolStates[toolId] = new ToolStateRecord();
      });

      const newToolStatesMap = Map(newToolStates);

      state = newToolStatesMap.size > 0
        ? state.set('toolStates', state.toolStates.merge(newToolStatesMap))
        : state;

      const needToChangeActiveTool =
        state.activeToolId === null ||
        !action.toolIds.includes(state.activeToolId);
  
      return needToChangeActiveTool
        ? selectTool(state, action.toolIds.get(0) || null)
        : state;
    }

    case DESKTOP_COLLAPSE_TOOLS_PANEL: {
      return state.set('toolsPanelIsExpanded', false);
    }

    case DESKTOP_EXPAND_TOOLS_PANEL: {
      return state.set('toolsPanelIsExpanded', true);
    }

    case DESKTOP_TOOL_DOCK: {
      if (state.activeToolId !== null) {
        state = state.setIn(
          ['toolStates', state.activeToolId, 'isActiveInToolsPanel'],
          false,
        );
      }

      if (state.stickyToolId !== null) {
        state = state.setIn(
          ['toolStates', state.stickyToolId, 'isInDockRegion'],
          false,
        );
      }

      if (state.toolStates.has(action.toolId)) {
        return state
          .setIn(['toolStates', action.toolId, 'docked'], true)
          .setIn(['toolStates', action.toolId, 'isActiveInToolsPanel'], true)
          .merge({
            stickyToolId: null,
            activeToolId: action.toolId,
          });
      } else {
        return state;
      }
    }

    case DESKTOP_TOOL_UNDOCK: {
      if (state.toolStates.has(action.toolId)) {
        if (state.activeToolId !== null) {
          state = state.setIn(
            ['toolStates', state.activeToolId, 'isActiveInToolsPanel'],
            false,
          );
        }

        if (action.nextActiveToolId !== null) {
          state = state.setIn(
            ['toolStates', action.nextActiveToolId, 'isActiveInToolsPanel'],
            true,
          );
        }

        return state
          .setIn(['toolStates', action.toolId, 'docked'], false)
          .set('activeToolId', action.nextActiveToolId);
      } else {
        return state;
      }
    }

    case DESKTOP_TOOL_CLOSE: {
      return changeToolStateProp(state, action.toolId, 'closed', true);
    }

    case DESKTOP_TOOL_OPEN: {
      return changeToolStateProp(state, action.toolId, 'closed', false);
    }

    case DESKTOP_TOOL_FOCUS: {
      if (state.toolStates.has(action.toolId)) {
        const newTopZIndex = state.topToolZIndex + 1;

        return state
          .setIn(['toolStates', action.toolId, 'zIndex'], newTopZIndex)
          .set('topToolZIndex', newTopZIndex);
      } else {
        return state;
      }
    }

    case DESKTOP_TOOL_SELECT: {
      return selectTool(state, action.toolId);
    }

    case DESKTOP_SET_STICKY_TOOL: {
      if (action.toolId === state.stickyToolId) return state;

      if (state.stickyToolId !== null) {
        state = state.setIn(
          ['toolStates', state.stickyToolId, 'isInDockRegion'],
          false,
        );
      }

      if (action.toolId !== null && state.toolStates.has(action.toolId)) {
        return state
          .setIn(['toolStates', action.toolId, 'isInDockRegion'], true)
          .set('stickyToolId', action.toolId);
      } else {
        return state.set('stickyToolId', null);
      }
    }

    case DESKTOP_TOOL_SET_ACTIVE_SECTION: {
      if (!state.toolStates.has(action.toolId)) return state;

      return state.setIn(
        ['toolStates', action.toolId, 'activeSection'],
        action.newActiveSection,
      );
    }

    case PREVIEW_START_DRAG_NEW_COMPONENT: {
      return setNecessaryToolActiveAfterDragStart(state);
    }

    case PREVIEW_START_DRAG_EXISTING_COMPONENT: {
      return setNecessaryToolActiveAfterDragStart(state);
    }

    case PREVIEW_DROP_COMPONENT: {
      return setNecessaryToolActiveAfterDrop(state, action.dropOnAreaId);
    }

    default: {
      return state;
    }
  }
};
