/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { List } from 'immutable';

// Routes editor tools
export const TOOL_ID_ROUTE_EDITOR = 'routeEditor';

export const TOOL_IDS_STRUCTURE = List([
  TOOL_ID_ROUTE_EDITOR,
]);

// Design tools
export const TOOL_ID_LIBRARY = 'componentsLibrary';
export const TOOL_ID_COMPONENTS_TREE = 'componentsTree';
export const TOOL_ID_PROPS_EDITOR = 'componentPropsEditor';

export const TOOL_IDS_DESIGN = List([
  TOOL_ID_LIBRARY,
  TOOL_ID_COMPONENTS_TREE,
  TOOL_ID_PROPS_EDITOR,
]);
