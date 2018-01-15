import React from 'react';
import { connect } from 'react-redux';

import {
  ComponentsTreeItem,
  ComponentsTreeItemContent,
} from '../../components/ComponentsTree/ComponentsTree';

import {
  connectDraggable,
} from '../ComponentsDragArea/ComponentsDragArea';

import draggable from '../../hocs/draggable';

import { DND_DRAG_START_RADIUS_TREE } from '../../config';
import { INVALID_ID } from '../../constants/misc';

import {
  selectedComponentIdsSelector,
  expandedTreeItemIdsSelector,
  highlightedTreeItemIdSelector,
} from '../../selectors';

import { isFunction } from '../../utils/misc';

import { isCompositeComponent } from '../../lib/meta';

const DraggableComponentItemContent =
  connectDraggable(draggable(ComponentsTreeItemContent));

const wrap = connect(
  (state, { componentId }) => ({
    selectedComponentIds: selectedComponentIdsSelector(state),
    expandedItemIds: expandedTreeItemIdsSelector(state),
    highlighted: highlightedTreeItemIdSelector(state) === componentId,
  }),
);

// eslint-disable-next-line react/prefer-stateless-function
class TreeItem extends React.PureComponent {
  render() {
    const {
      componentId,
      renderList,
      handleExpand,
      saveItemRef,
      handleSelect,
      handleHover,
      handleComponentDragStart,
      components,
      placeholderContainerId,
      pickingComponent,
      pickingComponentData,
      pickingComponentFilter,
      meta,
      expandedItemIds,
      selectedComponentIds,
      highlighted,
    } = this.props;

    const expanded =
      expandedItemIds.has(componentId) ||
      placeholderContainerId === componentId;

    const active =
      !pickingComponent &&
      !pickingComponentData &&
      selectedComponentIds.has(componentId);

    const component = components.get(componentId);
    const parentId = component.parentId;
    const isRootComponent = component.parentId === INVALID_ID;
    const parentComponent = isRootComponent ? null : components.get(parentId);
    const draggable =
      active &&
      selectedComponentIds.size === 1 &&
      !isRootComponent &&
      !isCompositeComponent(parentComponent.name, meta);

    let title;
    if (component.title) {
      title = component.title;
    } else {
      title = component.name;
    }

    const disabled =
      (pickingComponent || pickingComponentData) &&
      isFunction(pickingComponentFilter) &&
      !pickingComponentFilter(componentId);

    const dragData = { componentId };
    const subLevel = renderList(componentId);

    const hasSubLevel = !!subLevel;

    return (
      <ComponentsTreeItem
        key={String(componentId)}
      >
        <DraggableComponentItemContent
          key={String(componentId)}
          componentId={componentId}
          expanded={expanded}
          title={title}
          onExpand={handleExpand}
          disabled={disabled}
          active={active}
          hovered={highlighted}
          hasSubLevel={hasSubLevel}
          dragEnable={draggable}
          dragStartRadius={DND_DRAG_START_RADIUS_TREE}
          dragTitle={title}
          dragData={dragData}
          elementRef={saveItemRef}
          onSelect={handleSelect}
          onHover={handleHover}
          onDragStart={handleComponentDragStart}
        />
        {hasSubLevel && expanded ? subLevel : null}
      </ComponentsTreeItem>
    );
  }
}

export default wrap(TreeItem);
