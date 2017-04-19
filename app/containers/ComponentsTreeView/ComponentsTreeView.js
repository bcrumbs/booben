/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
import { dragHandler } from '../../hocs/dragHandler';

import {
  ComponentsTree,
  ComponentsTreeItem,
  ComponentsTreeList,
  ComponentsTreeLine,
} from '../../components/ComponentsTree/ComponentsTree';

import {
  BlockContentBox,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import {
  expandTreeItem,
  collapseTreeItem,
} from '../../actions/design';

import {
  selectPreviewComponent,
  deselectPreviewComponent,
  highlightPreviewComponent,
  unhighlightPreviewComponent,
  dragOverComponent,
  dragOverPlaceholder,
  dropComponent,
  DropComponentAreas,
} from '../../actions/preview';

import {
  currentComponentsSelector,
  currentRootComponentIdSelector,
  currentSelectedComponentIdsSelector,
  currentHighlightedComponentIdsSelector,
  getLocalizedTextFromState,
} from '../../selectors';

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
  isContainerComponent,
  isAtomicComponent,
  canInsertComponent,
} from '../../utils/meta';

/**
 *
 * @type {Object<string, number>}
 */
const CursorPositions = {
  TOP: 0,
  MIDDLE: 1,
  BOTTOM: 2,
  OUT: 3,
};

const DEFAULT_EXPAND_DELAY = 1000;
const DEFAULT_BORDER_PIXELS = 4;

/**
 *
 * @param {MouseEvent} mouseEvent
 * @param {HTMLElement} element
 * @param {number} borderPixels
 * @return {number}
 */
const calcCursorPosition = (mouseEvent, element, borderPixels) => {
  const { pageX, pageY } = mouseEvent;
  const { top, bottom, left, right } = element.getBoundingClientRect();
  
  if (pageX < left || pageX > right) return CursorPositions.OUT;
  
  if (pageY < bottom && pageY > top) {
    if (pageY - top <= borderPixels) return CursorPositions.TOP;
    if (bottom - pageY <= borderPixels) return CursorPositions.BOTTOM;
    return CursorPositions.MIDDLE;
  }
  
  return pageY - top < 0 ? CursorPositions.TOP : CursorPositions.BOTTOM;
};

class ComponentsTreeViewComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.isMouseOver = false;
    this.closestItemComponentId = -1;
    this.cursorState = CursorPositions.OUT;
    this.expandTimeout = null;
    this.itemRefs = new Map();

    this._renderItem = this._renderItem.bind(this);
    this._handleExpand = this._handleExpand.bind(this);
    this._handleSelect = this._handleSelect.bind(this);
    this._handleHover = this._handleHover.bind(this);
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._createElementRef = this._createElementRef.bind(this);
    this._createItemRef = this._createItemRef.bind(this);
    this._createLineRef = this._createLineRef.bind(this);
    this._expandComponent = this._expandComponent.bind(this);
    this._expandComponentAfterTime = this._expandComponentAfterTime.bind(this);
    this._clearExpandTimeout = this._clearExpandTimeout.bind(this);
    this._resetDrag = this._resetDrag.bind(this);
    this._scrollToLine = this._scrollToLine.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousemove', this._handleMouseMove);
  }

  componentDidUpdate() {
    this._scrollToLine();
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this._handleMouseMove);
    this.itemRefs.clear();
    if (this.expandTimeout !== null) this._clearExpandTimeout();
  }
  
  /**
   *
   * @private
   */
  _scrollToLine() {
    if (!this.lineElement) return;
    if (this.isMouseOver) this.lineElement.scrollIntoView(false);
  }
  
  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _createElementRef(ref) {
    this.element = ref;
  }
  
  /**
   *
   * @param {number} componentId
   * @param {HTMLElement} ref
   * @private
   */
  _createItemRef(componentId, ref) {
    this.itemRefs.set(componentId, ref);
  }
  
  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _createLineRef(ref) {
    this.lineElement = ref;
  }
  
  /**
   *
   * @private
   */
  _clearExpandTimeout() {
    clearTimeout(this.expandTimeout);
    this.expandTimeout = null;
  }
  
  /**
   *
   * @param {number} componentId
   * @private
   */
  _expandComponent(componentId) {
    const {
      draggingComponent,
      highlightedComponentIds,
      selectedComponentIds,
      expandedItemIds,
      onExpandItem,
    } = this.props;
    
    if (!draggingComponent || expandedItemIds.has(componentId)) return;
    
    const isSelectedOrHighlighted =
      highlightedComponentIds.has(componentId) ||
      selectedComponentIds.has(componentId);
    
    if (isSelectedOrHighlighted) onExpandItem(componentId);
    this.expandTimeout = null;
  }
  
  /**
   *
   * @param {number} componentId
   * @param {number} time
   * @private
   */
  _expandComponentAfterTime(componentId, time) {
    this.expandTimeout = setTimeout(this._expandComponent, time, componentId);
  }
  
  /**
   *
   * @private
   */
  _resetDrag() {
    const {
      draggingOverComponentId,
      placeholderContainerId,
      onDragOverComponent,
      onDragOverPlaceholder,
    } = this.props;
    
    if (draggingOverComponentId !== -1) onDragOverComponent(-1);
    if (placeholderContainerId !== -1) onDragOverPlaceholder(-1, -1);
  }
  
  /**
   *
   * @param {MouseEvent} event
   * @return {number}
   * @private
   */
  _getClosestCursorItemComponentId(event) {
    let closestItemComponentId = -1;
    let minHeightDiff = Infinity;
    
    this.itemRefs.forEach((ref, componentId) => {
      if (!ref) return;
      
      const { top, bottom } = ref.getBoundingClientRect();
      
      const minDiff = Math.min(
        Math.abs(event.pageY - top),
        Math.abs(event.pageY - bottom),
      );
      
      if (minDiff < minHeightDiff) {
        minHeightDiff = minDiff;
        closestItemComponentId = componentId;
      }
    });
    
    return closestItemComponentId;
  }
  
  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseUp(event) {
    const { draggingComponent, onDropComponent } = this.props;
    
    if (draggingComponent) {
      event.stopPropagation();
      onDropComponent(DropComponentAreas.TREE);
    }
  }
  
  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseMove(event) {
    const {
      meta,
      components,
      rootComponentId,
      draggingComponent,
      draggedComponents,
      draggedComponentId,
      draggingOverComponentId,
      placeholderContainerId,
      placeholderAfter,
      highlightedComponentIds,
      expandedItemIds,
      timeToExpand,
      borderPixels,
      onHighlightItem,
      onUnhighlightItem,
      onDragOverComponent,
      onDragOverPlaceholder,
    } = this.props;
    
    if (!draggingComponent) return;
  
    this.isMouseOver = !!this.element && this.element.contains(event.target);
    if (!this.isMouseOver) return;
  
    const closestItemComponentId =
      this._getClosestCursorItemComponentId(event);
  
    if (closestItemComponentId === -1) return;
  
    const itemElement = this.itemRefs.get(closestItemComponentId);
    const cursorPosition = calcCursorPosition(event, itemElement, borderPixels);
    const nothingChanged =
      cursorPosition === CursorPositions.OUT || (
        this.cursorState === cursorPosition &&
        this.closestItemComponentId === closestItemComponentId
      );
  
    if (nothingChanged) return;
  
    this.cursorState = cursorPosition;
    this.closestItemComponentId = closestItemComponentId;
  
    const highlighted = highlightedComponentIds
      .includes(this.closestItemComponentId);
  
    if (this.cursorState === CursorPositions.MIDDLE) {
      if (!highlighted) onHighlightItem(this.closestItemComponentId);
    } else if (highlighted) {
      onUnhighlightItem(this.closestItemComponentId);
    }
  
    const willDropInCurrentContainer =
      this.cursorState === CursorPositions.MIDDLE || (
        this.cursorState === CursorPositions.BOTTOM &&
        expandedItemIds.includes(this.closestItemComponentId)
      );
  
    const component = components.get(this.closestItemComponentId);
    const parentComponent = components.get(component.parentId);
    const container = (willDropInCurrentContainer || !parentComponent)
      ? component
      : parentComponent;
    
    this._clearExpandTimeout();
  
    if (!isAtomicComponent(component.name, meta))
      this._expandComponentAfterTime(this.closestItemComponentId, timeToExpand);
  
    if (
      this.cursorState === CursorPositions.MIDDLE &&
      !isContainerComponent(component.name, meta)
    ) {
      this._resetDrag();
      return;
    }
  
    if (!container || container.id === rootComponentId) return;
  
    let parentId = container.id;
    while (parentId > -1) {
      if (parentId === draggedComponentId) return;
      const component = components.get(parentId);
      if (component) parentId = component.parentId;
      else break;
    }
  
    let indexOfPlaceholder;
    if (willDropInCurrentContainer) {
      indexOfPlaceholder = container.children.size;
    } else {
      indexOfPlaceholder = container.children
        .indexOf(this.closestItemComponentId);
      
      if (this.cursorState === CursorPositions.TOP) indexOfPlaceholder -= 1;
    }
  
    const containerChildrenNames =
      container.children.map(childId => components.get(childId).name);
    
    const actualDraggedComponentId = draggedComponentId > -1
      ? draggedComponentId
      : 0;
    
    const draggedComponent = draggedComponents.get(actualDraggedComponentId);
  
    const canInsert = canInsertComponent(
      draggedComponent.name,
      container.name,
      containerChildrenNames,
      indexOfPlaceholder,
      meta,
    );
  
    if (!canInsert) {
      this._resetDrag();
      return;
    }
  
    if (draggingOverComponentId !== this.closestItemComponentId)
      onDragOverComponent(this.closestItemComponentId);
  
    const willFireDragOverPlaceholder =
      placeholderContainerId !== container.id ||
      placeholderAfter !== indexOfPlaceholder;
  
    if (willFireDragOverPlaceholder) {
      onDragOverPlaceholder(
        container.id,
        indexOfPlaceholder,
      );
    }
  }
  
  /**
   *
   * @param {number} componentId
   * @param {boolean} state
   * @private
   */
  _handleExpand(componentId, state) {
    const { onExpandItem, onCollapseItem } = this.props;
    
    if (state) onExpandItem(componentId);
    else onCollapseItem(componentId);
  }
  
  /**
   *
   * @param {number} componentId
   * @param {boolean} state
   * @private
   */
  _handleSelect(componentId, state) {
    const { onSelectItem, onDeselectItem } = this.props;
    
    if (state) onSelectItem(componentId);
    else onDeselectItem(componentId);
  }
  
  /**
   *
   * @param {number} componentId
   * @param {boolean} state
   * @private
   */
  _handleHover(componentId, state) {
    const {
      draggingComponent,
      onHighlightItem,
      onUnhighlightItem,
    } = this.props;
    
    if (state && !draggingComponent) onHighlightItem(componentId);
    else onUnhighlightItem(componentId);
  }
  
  /**
   *
   * @param {number} componentId
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseDown(componentId, event) {
    const { rootComponentId, onStartDragExistingComponent } = this.props;
    
    if (componentId !== rootComponentId)
      onStartDragExistingComponent(event, componentId);
  }
  
  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderLine() {
    //noinspection JSValidateTypes
    return (
      <ComponentsTreeLine
        createElementRef={this._createLineRef}
        key="divider-line"
      />
    );
  }
  
  /**
   *
   * @param {number} componentId
   * @param {number} idx
   * @return {ReactElement}
   * @private
   */
  _renderItem(componentId, idx) {
    const {
      meta,
      components,
      rootComponentId,
      draggingComponent,
      draggedComponents,
      draggedComponentId,
      draggingOverComponentId,
      placeholderContainerId,
      highlightedComponentIds,
      selectedComponentIds,
      expandedItemIds,
    } = this.props;
    
    const component = components.get(componentId);
    const indexOfLine = component.children.indexOf(draggingOverComponentId);
    
    let willRenderLine = false;
    if (draggingComponent && componentId === placeholderContainerId) {
      const actualDraggedComponentId = draggedComponentId !== -1
        ? draggedComponentId
        : 0;
      
      const draggedComponent = draggedComponents.get(actualDraggedComponentId);
  
      willRenderLine = canInsertComponent(
        draggedComponent.name,
        component.name,
        component.children.map(childId => components.get(childId).name),
        indexOfLine,
        meta,
      );
    }
    
    let children = null;
    if (component.children.size > 0) {
      children = this._renderList(
        component.children,
        willRenderLine,
        indexOfLine,
      );
    } else if (willRenderLine) {
      children = (
        <ComponentsTreeList>
          {this._renderLine()}
        </ComponentsTreeList>
      );
    }

    let title;
    let subtitle;
    if (component.title) {
      title = component.title;
      subtitle = component.name;
    } else {
      title = component.name;
      subtitle = '';
    }
    
    const expanded =
      expandedItemIds.has(componentId) ||
      draggingComponent && (
        !this.isMouseOver ||
        componentId === rootComponentId
      );
    
    const hovered = highlightedComponentIds.has(componentId) || willRenderLine;
    const active = selectedComponentIds.has(componentId);

    //noinspection JSValidateTypes
    return (
      <ComponentsTreeItem
        componentId={componentId}
        key={idx}
        title={title}
        subtitle={subtitle}
        expanded={expanded}
        active={active}
        hovered={hovered}
        onExpand={this._handleExpand}
        onSelect={this._handleSelect}
        onHover={this._handleHover}
        onMouseDown={this._handleMouseDown}
        createItemRef={this._createItemRef}
      >
        {children}
      </ComponentsTreeItem>
    );
  }
  
  /**
   *
   * @param {Immutable.List<number>} componentIds
   * @param {boolean} [showLine=false]
   * @param [indexOfLine=1]
   * @return {ReactElement}
   * @private
   */
  _renderList(componentIds, showLine = false, indexOfLine = -1) {
    const { draggingOverPlaceholder, placeholderAfter } = this.props;
    
    let children = componentIds.map(this._renderItem);
    
    if (showLine && draggingOverPlaceholder) {
      let indexOfLinePlaceholder = 0;
      
      if (indexOfLine !== -1) {
        indexOfLinePlaceholder = indexOfLine;
        if (placeholderAfter >= indexOfLine) indexOfLinePlaceholder += 1;
      } else if (placeholderAfter !== -1) {
        indexOfLinePlaceholder = placeholderAfter;
      }
  
      children = children.insert(indexOfLinePlaceholder, this._renderLine());
    }

    //noinspection JSValidateTypes
    return (
      <ComponentsTreeList>
        {children}
      </ComponentsTreeList>
    );
  }

  render() {
    const { rootComponentId, draggingComponent, getLocalizedText } = this.props;

    if (rootComponentId === -1) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('thereAreNoComponentsInThisRoute')}
        />
      );
    }
    
    const list = this._renderList(List([rootComponentId]));

    return (
      <BlockContentBox
        createElementRef={this._createElementRef}
        onMouseUp={this._handleMouseUp}
        autoScrollUpDown={draggingComponent}
        isBordered
        flex
      >
        <ComponentsTree>
          {list}
        </ComponentsTree>
      </BlockContentBox>
    );
  }
}

ComponentsTreeViewComponent.propTypes = {
  timeToExpand: PropTypes.number,
  borderPixels: PropTypes.number,
  components: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
  ).isRequired,
  rootComponentId: PropTypes.number.isRequired,
  selectedComponentIds: ImmutablePropTypes.setOf(
    PropTypes.number,
  ).isRequired,
  highlightedComponentIds: ImmutablePropTypes.setOf(
    PropTypes.number,
  ).isRequired,
  expandedItemIds: ImmutablePropTypes.setOf(PropTypes.number).isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  draggedComponentId: PropTypes.number.isRequired,
  draggedComponents: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
  ),
  draggingOverComponentId: PropTypes.number.isRequired,
  draggingOverPlaceholder: PropTypes.bool.isRequired,
  placeholderContainerId: PropTypes.number.isRequired,
  placeholderAfter: PropTypes.number.isRequired,
  meta: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onStartDragExistingComponent: PropTypes.func.isRequired,
  onExpandItem: PropTypes.func.isRequired,
  onCollapseItem: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  onDeselectItem: PropTypes.func.isRequired,
  onHighlightItem: PropTypes.func.isRequired,
  onUnhighlightItem: PropTypes.func.isRequired,
  onDragOverComponent: PropTypes.func.isRequired,
  onDragOverPlaceholder: PropTypes.func.isRequired,
  onDropComponent: PropTypes.func.isRequired,
};

ComponentsTreeViewComponent.defaultProps = {
  timeToExpand: DEFAULT_EXPAND_DELAY,
  borderPixels: DEFAULT_BORDER_PIXELS,
  draggedComponents: null,
};

ComponentsTreeViewComponent.displayName = 'ComponentsTreeView';

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  rootComponentId: currentRootComponentIdSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
  expandedItemIds: state.design.treeExpandedItemIds,
  draggingComponent: state.project.draggingComponent,
  draggedComponentId: state.project.draggedComponentId,
  draggedComponents: state.project.draggedComponents,
  draggingOverComponentId: state.project.draggingOverComponentId,
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  meta: state.project.meta,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onExpandItem: id =>
    void dispatch(expandTreeItem(id)),
  onCollapseItem: id =>
    void dispatch(collapseTreeItem(id)),
  onSelectItem: id =>
    void dispatch(selectPreviewComponent(id, true)),
  onDeselectItem: id =>
    void dispatch(deselectPreviewComponent(id)),
  onHighlightItem: id =>
    void dispatch(highlightPreviewComponent(id)),
  onUnhighlightItem: id =>
    void dispatch(unhighlightPreviewComponent(id)),
  onDragOverComponent: id =>
    void dispatch(dragOverComponent(id)),
  onDragOverPlaceholder: (id, afterIdx) =>
    void dispatch(dragOverPlaceholder(id, afterIdx)),
  onDropComponent: dropOnAreaId =>
    void dispatch(dropComponent(dropOnAreaId)),
});

export const ComponentsTreeView = dragHandler(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ComponentsTreeViewComponent),
);
