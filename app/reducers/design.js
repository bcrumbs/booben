/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Set, List } from 'immutable';

import {
  DESIGN_TREE_COLLAPSE_ITEM,
  DESIGN_TREE_EXPAND_ITEM,
} from '../actions/design';

const DesignState = Record({
  treeExpandedItemIds: Set(),
});

const isArrayOrList = value => Array.isArray(value) || List.isList(value);

const handlers = {
  [DESIGN_TREE_EXPAND_ITEM]: (state, action) => {
    if (isArrayOrList(action.componentId)) {
      return state.update(
        'treeExpandedItemIds',
        ids => ids.union(action.componentId),
      );
    } else {
      return state.update(
        'treeExpandedItemIds',
        ids => ids.add(action.componentId),
      );
    }
  },
  
  [DESIGN_TREE_COLLAPSE_ITEM]: (state, action) => {
    if (isArrayOrList(action.componentId)) {
      return state.update(
        'treeExpandedItemIds',
        ids => ids.subtract(action.componentId),
      );
    } else {
      return state.update(
        'treeExpandedItemIds',
        ids => ids.delete(action.componentId),
      );
    }
  },
};

export default (state = new DesignState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
