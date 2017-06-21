/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  STRUCTURE_SCREEN: {
    UNDO: {
      osx: 'command+z',
      windows: 'ctrl+z',
      linux: 'ctrl+z',
    },
    REDO: {
      osx: 'command+shift+z',
      windows: 'ctrl+shift+z',
      linux: 'ctrl+shift+z',
    },
  },
  
  ROUTES_LIST: {
    DELETE_ROUTE: {
      osx: 'command+backspace',
      windows: 'del',
      linux: 'del',
    },
    CREATE_CHILD_ROUTE: {
      osx: 'command+shift+r',
      windows: 'ctrl+shift+r',
      linux: 'ctrl+shift+r',
    },
    CREATE_ROOT_ROUTE: {
      osx: 'command+shift+alt+r',
      windows: 'ctrl+shift+alt+r',
      linux: 'ctrl+shift+alt+r',
    },
    SELECT_NEXT_ROUTE: 'down',
    SELECT_PREVIOUS_ROUTE: 'up',
    SELECT_CHILD_ROUTE: 'right',
    SELECT_PARENT_ROUTE: 'left',
    GO_TO_DESIGN: 'enter',
  },
  
  DESIGN_SCREEN: {
    UNDO: {
      osx: 'command+z',
      windows: 'ctrl+z',
      linux: 'ctrl+z',
    },
    REDO: {
      osx: 'command+shift+z',
      windows: 'ctrl+shift+z',
      linux: 'ctrl+shift+z',
    },
    DELETE_COMPONENT: {
      osx: 'command+backspace',
      windows: 'del',
      linux: 'del',
    },
    DUPLICATE_COMPONENT: {
      osx: 'command+alt+d',
      windows: 'ctrl+alt+d',
      linux: 'ctrl+alt+d',
    },
    GO_TO_STRUCTURE: {
      osx: 'command+alt+q',
      windows: 'ctrl+alt+q',
      linux: 'ctrl+alt+q',
    },
  },
  
  COMPONENTS_TREE: {
    SELECT_NEXT_COMPONENT: 'down',
    SELECT_PREVIOUS_COMPONENT: 'up',
    SELECT_CHILD_COMPONENT: 'right',
    SELECT_PARENT_COMPONENT: 'left',
  },
};
