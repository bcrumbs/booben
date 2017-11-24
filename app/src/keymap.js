/**
 * @author Dmitriy Bizyaev
 */

export default {
  STRUCTURE_SCREEN: {
    UNDO: {
      osx: 'command+alt+z',
      windows: 'ctrl+alt+z',
      linux: 'ctrl+alt+z',
    },
    REDO: {
      osx: 'command+shift+alt+z',
      windows: 'ctrl+shift+alt+z',
      linux: 'ctrl+shift+alt+z',
    },
  },
  
  ROUTES_LIST: {
    DELETE_ROUTE: {
      osx: 'command+backspace',
      windows: 'del',
      linux: 'del',
    },
    CREATE_CHILD_ROUTE: {
      osx: 'command+alt+r',
      windows: 'ctrl+alt+r',
      linux: 'ctrl+alt+r',
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
    GO_TO_DESIGN: {
      osx: 'command+enter',
      windows: 'ctrl+enter',
      linux: 'ctrl+enter',
    },
  },
  
  DESIGN_SCREEN: {
    UNDO: {
      osx: 'command+alt+z',
      windows: 'ctrl+alt+z',
      linux: 'ctrl+alt+z',
    },
    REDO: {
      osx: 'command+shift+alt+z',
      windows: 'ctrl+shift+alt+z',
      linux: 'ctrl+shift+alt+z',
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
    COPY_COMPONENT: {
      osx: 'command+alt+c',
      windows: 'ctrl+alt+c',
      linux: 'ctrl+alt+c',
    },
    CUT_COMPONENT: {
      osx: 'command+alt+x',
      windows: 'ctrl+alt+x',
      linux: 'ctrl+alt+x',
    },
    PASTE_COMPONENT: {
      osx: 'command+alt+v',
      windows: 'ctrl+alt+v',
      linux: 'ctrl+alt+v',
    },
    GO_TO_STRUCTURE: {
      osx: 'command+alt+q',
      windows: 'ctrl+alt+q',
      linux: 'ctrl+alt+q',
    },
    OPEN_CREATE_COMPONENT_MENU: {
      osx: 'command+alt+n',
      windows: 'ctrl+alt+n',
      linux: 'ctrl+alt+n',
    },
  },
  
  COMPONENTS_TREE: {
    SELECT_NEXT_COMPONENT: 'down',
    SELECT_PREVIOUS_COMPONENT: 'up',
    SELECT_CHILD_COMPONENT: 'right',
    SELECT_PARENT_COMPONENT: 'left',
    MOVE_CURSOR_DOWN: 'shift+down',
    MOVE_CURSOR_UP: 'shift+up',
    MOVE_CURSOR_OUTSIDE: 'shift+left',
    MOVE_CURSOR_INTO: 'shift+right',
  },

  CREATE_COMPONENT_MENU: {
    CREATE: 'enter',
    CLOSE: 'esc',
    SELECT_NEXT: 'down',
    SELECT_PREVIOUS: 'up',
  },
};
