/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Map, Record, List } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import { matchPath } from 'react-router';

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
} from '../actions/desktop';

import {
  PREVIEW_START_DRAG_NEW_COMPONENT,
  PREVIEW_START_DRAG_EXISTING_COMPONENT,
  PREVIEW_DROP_COMPONENT,
  PREVIEW_SELECT_COMPONENT,
  PREVIEW_DESELECT_COMPONENT,
  ComponentDropAreas,
} from '../actions/preview';

import {
  PROJECT_PICK_COMPONENT,
  PROJECT_PICK_COMPONENT_DONE,
  PROJECT_PICK_COMPONENT_STATE_SLOT,
  PROJECT_PICK_COMPONENT_CANCEL,
} from '../actions/project';

import {
  TOOL_ID_COMPONENTS_TREE,
  TOOL_ID_PROPS_EDITOR,
  TOOL_IDS_STRUCTURE,
  TOOL_IDS_DESIGN,
} from '../constants/toolIds';

import ToolStateRecord from '../models/ToolState';
import { PATH_STRUCTURE, PATH_DESIGN } from '../constants/paths';

const DesktopState = Record({
  toolStates: Map(),
  toolsPanelIsExpanded: true,
  activeToolId: null,
  shadowedToolId: null,
  topToolZIndex: 0,
  stickyToolId: null,
  pickingStateSlot: false,
});

const selectTool = (state, toolId) => {
  if (toolId === state.activeToolId && state.toolsPanelIsExpanded)
    return state;

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

const setActiveSection = (state, toolId, newActiveSection) =>
  changeToolStateProp(state, toolId, 'activeSection', newActiveSection);

const temporarilySelectTool = (state, toolId) => {
  const willSelect =
    state.activeToolId !== toolId &&
    state.toolStates.get(toolId).docked;
  
  if (!willSelect) return state;
  
  state = state.set('shadowedToolId', state.activeToolId);
  
  state = state.setIn(
    ['toolStates', state.activeToolId, 'isShadowedInToolsPanel'],
    true,
  );
  
  return selectTool(state, toolId);
};

const selectPreviousTool = state => {
  if (!state.shadowedToolId) return state;

  state = state.setIn(
    ['toolStates', state.shadowedToolId, 'isShadowedInToolsPanel'],
    false,
  );
  
  if (state.toolStates.get(state.shadowedToolId).docked)
    state = selectTool(state, state.shadowedToolId);
  
  return state.set('shadowedToolId', null);
};

const setActiveTools = (state, toolIds) => {
  const newToolStates = {};
  
  toolIds.forEach(toolId => {
    if (!state.toolStates.has(toolId))
      newToolStates[toolId] = new ToolStateRecord();
  });
  
  const newToolStatesMap = Map(newToolStates);
  
  state = newToolStatesMap.size > 0
    ? state.set('toolStates', state.toolStates.merge(newToolStatesMap))
    : state;
  
  const needToChangeActiveTool =
    state.activeToolId === null ||
    !toolIds.includes(state.activeToolId);
  
  return needToChangeActiveTool
    ? selectTool(state, toolIds.get(0) || null)
    : state;
};

const handlers = {
  [LOCATION_CHANGE]: (state, action) => {
    const pathname = action.payload.pathname;
    
    const structureMatch = matchPath(pathname, {
      path: PATH_STRUCTURE,
      exact: true,
      strict: false,
    });
    
    if (structureMatch) return setActiveTools(state, TOOL_IDS_STRUCTURE);
    
    const designMatch = matchPath(pathname, {
      path: PATH_DESIGN,
      exact: false,
      strict: false,
    });
    
    if (designMatch) return setActiveTools(state, TOOL_IDS_DESIGN);
    
    return setActiveTools(state, List());
  },
  
  [DESKTOP_SET_TOOLS]: (state, action) =>
    setActiveTools(state, action.toolIds),
  
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
    
    if (!state.toolStates.has(action.toolId)) return state;
  
    return state
      .setIn(['toolStates', action.toolId, 'docked'], true)
      .setIn(['toolStates', action.toolId, 'isActiveInToolsPanel'], true)
      .merge({
        stickyToolId: null,
        activeToolId: action.toolId,
      });
  },
  
  [DESKTOP_TOOL_UNDOCK]: (state, action) => {
    if (!state.toolStates.has(action.toolId)) return state;
  
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
  },
  
  [DESKTOP_TOOL_CLOSE]: (state, action) =>
    changeToolStateProp(state, action.toolId, 'closed', true),
  
  [DESKTOP_TOOL_OPEN]: (state, action) =>
    changeToolStateProp(state, action.toolId, 'closed', false),
  
  [DESKTOP_TOOL_FOCUS]: (state, action) => {
    if (!state.toolStates.has(action.toolId)) return state;
  
    const newTopZIndex = state.topToolZIndex + 1;
  
    return state
      .setIn(['toolStates', action.toolId, 'zIndex'], newTopZIndex)
      .set('topToolZIndex', newTopZIndex);
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
  
  [DESKTOP_TOOL_SET_ACTIVE_SECTION]: (state, action) =>
    setActiveSection(state, action.toolId, action.newActiveSection),
  
  [PREVIEW_START_DRAG_NEW_COMPONENT]: state =>
    temporarilySelectTool(state, TOOL_ID_COMPONENTS_TREE),
  
  [PREVIEW_START_DRAG_EXISTING_COMPONENT]: state =>
    temporarilySelectTool(state, TOOL_ID_COMPONENTS_TREE),
  
  [PREVIEW_DROP_COMPONENT]: (state, action) =>
    action.dropOnAreaId === ComponentDropAreas.TREE
      ? state
      : selectPreviousTool(state),
  
  [PROJECT_PICK_COMPONENT]: (state, action) => {
    state = state.set('pickingStateSlot', action.stateSlot);
    return temporarilySelectTool(state, TOOL_ID_COMPONENTS_TREE);
  },
  
  [PROJECT_PICK_COMPONENT_DONE]: state => state.pickingStateSlot
    ? state
    : selectPreviousTool(state),
  
  [PROJECT_PICK_COMPONENT_STATE_SLOT]: state => selectPreviousTool(state),
  
  [PROJECT_PICK_COMPONENT_CANCEL]: state => selectPreviousTool(state),

  [PREVIEW_SELECT_COMPONENT]: (state, action) => {
    if (action.openConfigurationTool) {
      const componentConfigToolState =
        state.toolStates.get(TOOL_ID_PROPS_EDITOR);
  
      if (componentConfigToolState && componentConfigToolState.docked)
        state = selectTool(state, TOOL_ID_PROPS_EDITOR);
    }

    return setActiveSection(state, state.activeToolId, 0);
  },

  [PREVIEW_DESELECT_COMPONENT]: state =>
    setActiveSection(state, state.activeToolId, 0),
};

export default (state = new DesktopState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
