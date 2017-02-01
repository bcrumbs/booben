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
  DropComponentAreas,
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
    dropOnAreaId !== DropComponentAreas.TREE;
  
  if (willSelectPreviousTool)
    state = selectTool(state, state.previousActiveToolId);
  
  return state.set('previousActiveToolId', null);
};

const handlers = {
  [DESKTOP_SET_TOOLS]: (state, action) => {
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
  },
  
  [DESKTOP_COLLAPSE_TOOLS_PANEL]: state =>
    state.set('toolsPanelIsExpanded', false),
  
  [DESKTOP_EXPAND_TOOLS_PANEL]: state =>
    state.set('toolsPanelIsExpanded', true),
  
  [DESKTOP_TOOL_DOCK]: (state, action) => {
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
  },
  
  [DESKTOP_TOOL_UNDOCK]: (state, action) => {
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
  },
  
  [DESKTOP_TOOL_CLOSE]: (state, action) =>
    changeToolStateProp(state, action.toolId, 'closed', true),
  
  [DESKTOP_TOOL_OPEN]: (state, action) =>
    changeToolStateProp(state, action.toolId, 'closed', false),
  
  [DESKTOP_TOOL_FOCUS]: (state, action) => {
    if (state.toolStates.has(action.toolId)) {
      const newTopZIndex = state.topToolZIndex + 1;
    
      return state
        .setIn(['toolStates', action.toolId, 'zIndex'], newTopZIndex)
        .set('topToolZIndex', newTopZIndex);
    } else {
      return state;
    }
  },
  
  [DESKTOP_TOOL_SELECT]: (state, action) => selectTool(state, action.toolId),
  
  [DESKTOP_SET_STICKY_TOOL]: (state, action) => {
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
  },
  
  [DESKTOP_TOOL_SET_ACTIVE_SECTION]: (state, action) => {
    if (!state.toolStates.has(action.toolId)) return state;
  
    return state.setIn(
      ['toolStates', action.toolId, 'activeSection'],
      action.newActiveSection,
    );
  },
  
  [PREVIEW_START_DRAG_NEW_COMPONENT]: state =>
    setNecessaryToolActiveAfterDragStart(state),
  
  [PREVIEW_START_DRAG_EXISTING_COMPONENT]: state =>
    setNecessaryToolActiveAfterDragStart(state),
  
  [PREVIEW_DROP_COMPONENT]: (state, action) =>
    setNecessaryToolActiveAfterDrop(state, action.dropOnAreaId),
};

export default (state = new DesktopState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
