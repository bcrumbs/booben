import { Record, Set } from 'immutable';
import { INVALID_ID } from '../constants/misc';

const defaults = {
  selectedComponentIds: Set(),
  highlightedComponentIds: Set(),
  expandedTreeItemIds: Set(),
  expandedRouteTreeItemIds: Set(),
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

  expandTreeItem(componentId) {
    return this.update('expandedTreeItemIds', ids => ids.add(componentId));
  }

  expandRouteTreeItem(routeId) {
    return this.update('expandedRouteTreeItemIds', ids => ids.add(routeId));
  }

  collapseRouteTreeItem(routeId) {
    return this.update('expandedRouteTreeItemIds', ids => ids.delete(routeId));
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
