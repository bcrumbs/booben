/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export const DESIGN_TREE_EXPAND_ITEM = 'DESIGN_TREE_EXPAND_ITEM';

export const expandTreeItem = componentId => ({
    type: DESIGN_TREE_EXPAND_ITEM,
    componentId
});

export const DESIGN_TREE_COLLAPSE_ITEM = 'DESIGN_TREE_COLLAPSE_ITEM';

export const collapseTreeItem = componentId => ({
    type: DESIGN_TREE_COLLAPSE_ITEM,
    componentId
});
