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
  TOGGLE_TREE_VIEW_MODE,
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
  PROJECT_PICK_COMPONENT_DATA,
  PROJECT_PICK_COMPONENT_CANCEL,
} from '../actions/project';

import {
  TOOL_ID_COMPONENTS_TREE,
  TOOL_ID_PROPS_EDITOR,
  TOOL_IDS_STRUCTURE,
  TOOL_IDS_DESIGN,
} from '../constants/tool-ids';

import ToolStateRecord from '../models/ToolState';
import { PATH_STRUCTURE, PATH_DESIGN } from '../constants/paths';

const DesktopState = Record({
  toolStates: Map(),
  leftToolsPanelIsExpanded: true,
  rightToolsPanelIsExpanded: true,
  // TODO: clean this
  activeToolId: null,
  leftActiveToolId: null,
  rightActiveToolId: null,
  shadowedToolId: null,
  topToolZIndex: 0,
  stickyToolId: null,
  pickingComponentData: false,
  treeViewMode: 'routeTree',
});

const selectTool = (state, toolId) => {
  if (toolId === null) return state;
  const position = state.toolStates.get(toolId).position;
  
  if (position === 'left') {
    if (state.leftActiveToolId !== null) {
      state = state.setIn(
        ['toolStates', state.leftActiveToolId, 'isActiveInToolsPanel'],
        false,
      );
    }

    if (toolId !== null && state.toolStates.has(toolId)) {
      return state
        .setIn(['toolStates', toolId, 'isActiveInToolsPanel'], true)
        .merge({
          leftActiveToolId: toolId,
          leftToolsPanelIsExpanded: true,
        });
    } else {
      return state;
    }
  } else if (position === 'right') {
    if (state.rightActiveToolId !== null) {
      state = state.setIn(
        ['toolStates', state.rightActiveToolId, 'isActiveInToolsPanel'],
        false,
      );
    }

    if (toolId !== null && state.toolStates.has(toolId)) {
      return state
        .setIn(['toolStates', toolId, 'isActiveInToolsPanel'], true)
        .merge({
          rightActiveToolId: toolId,
          rightToolsPanelIsExpanded: true,
        });
    } else {
      return state;
    }
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
  
  if (state.toolStates.get(state.shadowedToolId).docked) {
    state = selectTool(state, state.shadowedToolId);
  }
  
  return state.set('shadowedToolId', null);
};

const setActiveTools = (state, toolIds) => {
  const newToolStates = {};
  
  toolIds.forEach(toolId => {
    if (!state.toolStates.has(toolId)) {
      if (toolId === 'componentsTree' || toolId === 'routesTree') {
        newToolStates[toolId] = new ToolStateRecord({ position: 'left' });
      } else {
        newToolStates[toolId] = new ToolStateRecord();
      }
    }
  });
  
  const newToolStatesMap = Map(newToolStates);
  
  state = newToolStatesMap.size > 0
    ? state.set('toolStates', state.toolStates.merge(newToolStatesMap))
    : state;
  
  const needToChangeActiveTool =
    state.activeToolId === null ||
    !toolIds.includes(state.activeToolId);

  if (needToChangeActiveTool) {
    state = selectTool(state, toolIds.get(0) || null);
    state = selectTool(state, toolIds.get(1) || null);
    return state;
  } else {
    return state;
  }
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
  
  [DESKTOP_COLLAPSE_TOOLS_PANEL]: (state, action) => {
    if (action.position === 'left') {
      return state.set('leftToolsPanelIsExpanded', false);
    } else if (action.position === 'right') {
      return state.set('rightToolsPanelIsExpanded', false);
    } else {
      return state;
    }
  },
    
  
  [DESKTOP_EXPAND_TOOLS_PANEL]: (state, action) => {
    if (action.position === 'left') {
      return state.set('leftToolsPanelIsExpanded', true);
    } else if (action.position === 'right') {
      return state.set('rightToolsPanelIsExpanded', true);
    } else {
      return state;
    }
  },
    
  
  [DESKTOP_TOOL_DOCK]: (state, action) => {
    const position = state.toolStates.get(action.toolId).position;

    state = state.setIn(
      ['toolStates', state[`${position}ActiveToolId`], 'isActiveInToolsPanel'],
      false,
    );
  
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
        [`${position}ActiveToolId`]: action.toolId,
      });
  },
  
  [DESKTOP_TOOL_UNDOCK]: (state, action) => {
    const position = state.toolStates.get(action.toolId).position;
    
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
      .set(`${position}ActiveToolId`, action.nextActiveToolId);
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
        .setIn(['toolStates', action.toolId, 'position'], action.position)
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
    state = state.set('pickingComponentData', action.pickData);
    return temporarilySelectTool(state, TOOL_ID_COMPONENTS_TREE);
  },
  
  [PROJECT_PICK_COMPONENT_DONE]: state => state.pickingComponentData
    ? state
    : selectPreviousTool(state),
  
  [PROJECT_PICK_COMPONENT_DATA]: state => selectPreviousTool(state),
  
  [PROJECT_PICK_COMPONENT_CANCEL]: state => selectPreviousTool(state),

  [PREVIEW_SELECT_COMPONENT]: (state, action) => {
    if (action.openConfigurationTool) {
      const componentConfigToolState =
        state.toolStates.get(TOOL_ID_PROPS_EDITOR);
  
      if (componentConfigToolState && componentConfigToolState.docked) {
        state = state.setIn(['treeViewMode'], 'routeTree');
        state = selectTool(state, TOOL_ID_PROPS_EDITOR);
      }
    }

    return setActiveSection(state, state.activeToolId, 0);
  },

  [PREVIEW_DESELECT_COMPONENT]: state =>
    setActiveSection(state, state.activeToolId, 0),

  [TOGGLE_TREE_VIEW_MODE]: state => {
    const currentTreeViewMode = state.treeViewMode;

    if (currentTreeViewMode === 'routeTree') {
      return state.setIn(['treeViewMode'], 'routesList');
    } else if (currentTreeViewMode === 'routesList') {
      return state.setIn(['treeViewMode'], 'routeTree');
    } else {
      return state;
    }
  },
};

export default (state = new DesktopState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
