/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Set } from 'immutable';
import { INVALID_ID } from '../constants/misc';

const defaults = {
  selectedComponentIds: Set(),
  highlightedComponentIds: Set(),
  cursorContainerId: INVALID_ID,
  cursorAfter: -1,
  clipboardComponentId: INVALID_ID,
  clipboardCopy: false,
  expandedTreeItemIds: Set(),
};

const DesignerRecord = Record(defaults);

export default class Designer extends DesignerRecord {
  selectComponent(componentId) {
    return this.update(
      'selectedComponentIds',
      selectedComponentIds => selectedComponentIds.add(componentId),
    );
  }
  
  selectComponentExclusive(componentId) {
    return this.set('selectedComponentIds', Set([componentId]));
  }
  
  highlightComponent(componentId) {
    return this.update(
      'highlightedComponentIds',
      highlightedComponentIds => highlightedComponentIds.add(componentId),
    );
  }
  
  unhighlightComponent(componentId) {
    return this.update(
      'highlightedComponentIds',
      highlightedComponentIds => highlightedComponentIds.delete(componentId),
    );
  }
  
  unhighlightAllComponents() {
    return this.set('highlightedComponentIds', Set());
  }
  
  deselectComponent(componentId) {
    return this.update(
      'selectedComponentIds',
      selectedComponentIds => selectedComponentIds.delete(componentId),
    );
  }
  
  toggleComponentSelection(componentId) {
    return this.get('selectedComponentIds').has(componentId)
      ? this.deselectComponent(componentId)
      : this.selectComponent(componentId);
  }
  
  setCursorPosition(containerId, afterIdx) {
    return this.merge({
      cursorContainerId: containerId,
      cursorAfter: afterIdx,
    });
  }
  
  updateClipboard(componentId, copy) {
    return this.merge({
      clipboardComponentId: componentId,
      clipboardCopy: copy,
    });
  }
  
  clearClipboard() {
    return this.updateClipboard(INVALID_ID, false);
  }
  
  expandTreeItem(componentId) {
    return this.update('expandedTreeItemIds', ids => ids.add(componentId));
  }
  
  expandTreeItems(componentIds) {
    return this.update('expandedTreeItemIds', ids => ids.union(componentIds));
  }
  
  collapseTreeItem(componentId) {
    return this.update('expandedTreeItemIds', ids => ids.delete(componentId));
  }
  
  collapseTreeItems(componentIds) {
    return this.update(
      'expandedTreeItemIds',
      ids => ids.subtract(componentIds),
    );
  }
  
  forgetComponent(componentId) {
    return this
      .collapseTreeItem(componentId)
      .deselectComponent(componentId)
      .unhighlightComponent(componentId);
  }
  
  reset() {
    return this.merge(defaults);
  }
}