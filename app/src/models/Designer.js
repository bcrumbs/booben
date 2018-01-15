/**
 * @author Dmitriy Bizyaev
 */

import { Record, Set } from 'immutable';

const defaults = {
  selectedComponentIds: Set(),
  highlightedComponentIds: Set(),
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
    return this.set(
      'highlightedComponentIds',
      Set([componentId]),
    );
  }

  unhighlightComponent() {
    return this.set(
      'highlightedComponentIds',
      Set(),
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
