import { Record, Set } from 'immutable';
import _omit from 'lodash.omit';
import { INVALID_ID } from '../constants/misc';

const defaults = {
  selectedComponentIds: Set(),
  highlightedComponentIds: Set(),
  expandedTreeItemIds: Set(),
  expandedRouteTreeItemIds: Set(),
  highlightRoutesIds: Set(),
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

  highlightRoute(routeId) {
    return this.update(
      'highlightRoutesIds',
      highlightRoutesIds => highlightRoutesIds.add(routeId),
    );
  }

  unhighlightRoute(routeId) {
    return this.update(
      'highlightRoutesIds',
      highlightRoutesIds => highlightRoutesIds.delete(routeId),
    );
  }

  unhighlightAllRoutes() {
    return this.set('highlightRoutesIds', Set());
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

  expandRouteTreeItems(routeIds) {
    return this.update('expandedRouteTreeItemIds', ids => ids.union(routeIds));
  }

  collapseRouteTreeItem(routeId) {
    return this.update('expandedRouteTreeItemIds', ids => ids.delete(routeId));
  }

  collapseRouteTreeItems(routeIds) {
    return this.update(
      'expandedRouteTreeItemIds',
      ids => ids.subtract(routeIds),
    );
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
    return this.merge(_omit(defaults, ['expandedRouteTreeItemIds']));
  }
}
