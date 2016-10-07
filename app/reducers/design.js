/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import {
    DESIGN_TREE_COLLAPSE_ITEM,
    DESIGN_TREE_EXPAND_ITEM
} from '../actions/design';

import { Record, Set, List } from 'immutable';

const DesignState = Record({
    treeExpandedItemIds: Set()
});

const isArrayOrList = value => Array.isArray(value) || List.isList(value);

export default (state = new DesignState(), action) => {
    switch (action.type) {
        case DESIGN_TREE_EXPAND_ITEM:
            if (isArrayOrList(action.componentId)) {
                return state.update(
                    'treeExpandedItemIds',
                    ids => ids.union(action.componentId)
                );
            }
            else {
                return state.update(
                    'treeExpandedItemIds',
                    ids => ids.add(action.componentId)
                );
            }

        case DESIGN_TREE_COLLAPSE_ITEM:
            if (isArrayOrList(action.componentId)) {
                return state.update(
                    'treeExpandedItemIds',
                    ids => ids.subtract(action.componentId)
                );
            }
            else {
                return state.update(
                    'treeExpandedItemIds',
                    ids => ids.delete(action.componentId)
                );
            }

        default:
            return state;
    }
};
