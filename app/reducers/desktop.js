/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Map, Record } from 'immutable';

import {
    DESKTOP_ADD_TOOLS,
    DESKTOP_COLLAPSE_TOOLS_PANEL,
    DESKTOP_EXPAND_TOOLS_PANEL,
    DESKTOP_TOOL_DOCK,
    DESKTOP_TOOL_UNDOCK,
    DESKTOP_TOOL_FOCUS,
    DESKTOP_TOOL_SELECT,
    DESKTOP_TOOL_CLOSE,
    DESKTOP_TOOL_OPEN,
    DESKTOP_SET_STICKY_TOOL
} from '../actions/desktop';

import ToolStateRecord from '../models/ToolState';

const DesktopState = Record({
    toolStates: Map(),
    toolsPanelIsExpanded: true,
    activeToolId: null,
    topToolZIndex: 0,
    stickyToolId: null,
});

export default (state = new DesktopState(), action) => {
    switch (action.type) {
        case DESKTOP_ADD_TOOLS:
            const newToolStates = {};

            action.newToolGroups.forEach(tools => {
                tools.forEach(tool => {
                    if (!state.toolStates.has(tool.id))
                        newToolStates[tool.id] = new ToolStateRecord()
                });
            });

            const newToolStatesMap = Map(newToolStates);

            return newToolStatesMap.size > 0
                ? state.set('toolStates', state.toolStates.merge(newToolStatesMap))
                : state;

        case DESKTOP_COLLAPSE_TOOLS_PANEL:
            return state.set('toolsPanelIsExpanded', false);

        case DESKTOP_EXPAND_TOOLS_PANEL:
            return state.set('toolsPanelIsExpanded', true);

        case DESKTOP_TOOL_DOCK:
            if (state.activeToolId !== null) {
                state = state.setIn(
                    ['toolStates', state.activeToolId, 'isActiveInToolsPanel'],
                    false
                );
            }

            if (state.stickyToolId !== null) {
                state = state.setIn(
                    ['toolStates', state.stickyToolId, 'isInDockRegion'],
                    false
                );
            }

            if (state.toolStates.has(action.toolId)) {
                return state
                    .setIn(['toolStates', action.toolId, 'docked'], true)
                    .setIn(['toolStates', action.toolId, 'isActiveInToolsPanel'], true)
                    .set('stickyToolId', null)
                    .set('activeToolId', action.toolId)
            }
            else {
                return state;
            }

        case DESKTOP_TOOL_UNDOCK:
            if (state.toolStates.has(action.toolId)) {
                if (state.activeToolId !== null) {
                    state = state.setIn(
                        ['toolStates', state.activeToolId, 'isActiveInToolsPanel'],
                        false
                    );
                }

                if (action.nextActiveToolId !== null) {
                    state = state.setIn(
                        ['toolStates', action.nextActiveToolId, 'isActiveInToolsPanel'],
                        true
                    );
                }

                return state
                    .setIn(['toolStates', action.toolId, 'docked'], false)
                    .set('activeToolId', action.nextActiveToolId);
            }
            else {
                return state;
            }

        case DESKTOP_TOOL_CLOSE:
            if (state.toolStates.has(action.toolId))
                return state.setIn(['toolStates', action.toolId, 'closed'], true);
            else
                return state;

        case DESKTOP_TOOL_OPEN:
            if (state.toolStates.has(action.toolId))
                return state.setIn(['toolStates', action.toolId, 'closed'], false);
            else
                return state;

        case DESKTOP_TOOL_FOCUS:
            if (state.toolStates.has(action.toolId)) {
                const newTopZIndex = state.topToolZIndex + 1;

                return state
                    .setIn(['toolStates', action.toolId, 'zIndex'], newTopZIndex)
                    .set('topToolZIndex', newTopZIndex);
            }
            else {
                return state;
            }
            
        case DESKTOP_TOOL_SELECT:
            if (action.toolId === state.activeToolId) return state;
            
            if (state.activeToolId !== null) {
                state = state.setIn(
                    ['toolStates', state.activeToolId, 'isActiveInToolsPanel'],
                    false
                );
            }

            if (action.toolId !== null && state.toolStates.has(action.toolId)) {
                return state
                    .setIn(['toolStates', action.toolId, 'isActiveInToolsPanel'], true)
                    .set('activeToolId', action.toolId)
                    .set('toolsPanelIsExpanded', true);
            }
            else {
                return state.set('activeToolId', null);
            }

        case DESKTOP_SET_STICKY_TOOL:
            if (action.toolId === state.stickyToolId) return state;

            if (state.stickyToolId !== null) {
                state = state.setIn(
                    ['toolStates', state.stickyToolId, 'isInDockRegion'],
                    false
                );
            }

            if (action.toolId !== null && state.toolStates.has(action.toolId)) {
                return state
                    .setIn(['toolStates', action.toolId, 'isInDockRegion'], true)
                    .set('stickyToolId', action.toolId);
            }
            else {
                return state.set('stickyToolId', null);
            }

        default: return state;
    }
};
