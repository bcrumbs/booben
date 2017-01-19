/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
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
} from '../../selectors';

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
  isContainerComponent,
  isAtomicComponent,
  canInsertComponent,
} from '../../utils/meta';

import { getLocalizedTextFromState } from '../../utils';

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

/**
 *
 * @param {MouseEvent} mouseEvent
 * @param {HTMLElement} element
 * @param {number} borderPixels
 * @return {number}
 */
const calculateCursorPosition = (mouseEvent, element, borderPixels) => {
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
    if (!this.props.draggingComponent) return;
    if (this.props.expandedItemIds.has(componentId)) return;
    
    const isSelectedOrHighlighted =
      this.props.highlightedComponentIds.has(componentId) ||
      this.props.selectedComponentIds.has(componentId);
    
    if (isSelectedOrHighlighted) this.props.onExpandItem(componentId);
    
    this.expandTimeout = null;
  }
  
  /**
   *
   * @param {number} componentId
   * @param {number} time
   * @private
   */
  _expandComponentAfterTime(componentId, time) {
    this.expandTimeout = setTimeout(
      this._expandComponent,
      time,
      componentId,
    );
  }
  
  /**
   *
   * @private
   */
  _resetDrag() {
    if (this.props.draggingOverComponentId !== -1)
      this.props.onDragOverComponent(-1);
    
    if (this.props.placeholderContainerId !== -1)
      this.props.onDragOverPlaceholder(-1, -1);
  }
  
  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseUp(event) {
    if (this.props.draggingComponent) {
      event.stopPropagation();
      this.props.onDropComponent(DropComponentAreas.TREE);
    }
  }
  
  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseMove(event) {
    if (!this.props.draggingComponent) return;
  
    this.isMouseOver = this.element && this.element.contains(event.target);
    if (!this.isMouseOver) return;
  
    const closestItemComponentId =
      this._getClosestCursorItemComponentId(event);
  
    if (closestItemComponentId === -1) return;
  
    const itemElement = this.itemRefs.get(closestItemComponentId);
  
    if (!itemElement) {
      this._resetDrag();
      return;
    }
  
    const cursorState = calculateCursorPosition(
      event,
      itemElement,
      this.props.borderPixels,
    );
  
    if (
      cursorState === CursorPositions.OUT ||
      this.cursorState === cursorState &&
      this.closestItemComponentId === closestItemComponentId
    ) return;
  
    this.cursorState = cursorState;
    this.closestItemComponentId = closestItemComponentId;
  
    const highlighted = this.props.highlightedComponentIds
      .includes(this.closestItemComponentId);
  
    if (this.cursorState === CursorPositions.MIDDLE) {
      if (!highlighted)
        this.props.onHighlightItem(this.closestItemComponentId);
    } else if (highlighted) {
      this.props.onUnhighlightItem(this.closestItemComponentId);
    }
  
    const willDropInCurrentContainer =
      this.cursorState === CursorPositions.MIDDLE ||
      this.cursorState === CursorPositions.BOTTOM
      && this.props.expandedItemIds.includes(
        this.closestItemComponentId,
      );
  
    const component =
      this.props.components.get(this.closestItemComponentId);
  
    const parentComponent =
      this.props.components.get(component.parentId);
  
    const currentPlaceholderContainer =
      (willDropInCurrentContainer || !parentComponent)
        ? component
        : parentComponent;
    
    this._clearExpandTimeout();
  
    if (!isAtomicComponent(component.name, this.props.meta)) {
      this._expandComponentAfterTime(
        this.closestItemComponentId,
        this.props.timeToExpand,
      );
    }
  
    if (
      this.cursorState === CursorPositions.MIDDLE &&
      !isContainerComponent(component.name, this.props.meta)
    ) {
      this._resetDrag();
      return;
    }
  
    if (
      !currentPlaceholderContainer ||
      currentPlaceholderContainer.id === this.props.rootComponentId
    ) return;
  
    let parentId = currentPlaceholderContainer.id;
    while (parentId > -1) {
      if (parentId === this.props.draggedComponentId) return;
      const component = this.props.components.get(parentId);
      if (component) parentId = component.parentId;
      else break;
    }
  
    let indexOfPlaceholder;
    if (willDropInCurrentContainer) {
      indexOfPlaceholder = currentPlaceholderContainer.children.size;
    } else {
      indexOfPlaceholder = currentPlaceholderContainer.children
        .indexOf(this.closestItemComponentId);
      
      if (this.cursorState === CursorPositions.TOP) indexOfPlaceholder -= 1;
    }
  
    const currentPlaceholderContainerChildrenNames =
      currentPlaceholderContainer.children.map(childId =>
        this.props.components.get(childId).name);
  
    const canInsert = canInsertComponent(
      this.props.draggedComponents.get(
        this.props.draggedComponentId + 1
          ? this.props.draggedComponentId
          : 0,
      ).name,
      currentPlaceholderContainer.name,
      currentPlaceholderContainerChildrenNames,
      indexOfPlaceholder,
      this.props.meta,
    );
  
    if (!canInsert) {
      this._resetDrag();
      return;
    }
  
    if (this.props.draggingOverComponentId !== this.closestItemComponentId)
      this.props.onDragOverComponent(this.closestItemComponentId);
  
    const willFireDragOverPlaceholder =
      this.props.placeholderContainerId !== currentPlaceholderContainer.id ||
      this.props.placeholderAfter !== indexOfPlaceholder;
  
    if (willFireDragOverPlaceholder) {
      this.props.onDragOverPlaceholder(
        currentPlaceholderContainer.id,
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
    if (state) this.props.onExpandItem(componentId);
    else this.props.onCollapseItem(componentId);
  }
  
  /**
   *
   * @param {number} componentId
   * @param {boolean} state
   * @private
   */
  _handleSelect(componentId, state) {
    if (state) this.props.onSelectItem(componentId);
    else this.props.onDeselectItem(componentId);
  }
  
  /**
   *
   * @param {number} componentId
   * @param {boolean} state
   * @private
   */
  _handleHover(componentId, state) {
    if (state && !this.props.draggingComponent)
      this.props.onHighlightItem(componentId);
    else
      this.props.onUnhighlightItem(componentId);
  }
  
  /**
   *
   * @param {MouseEvent} event
   * @return {number}
   * @private
   */
  _getClosestCursorItemComponentId(event) {
    let closestItemComponentId = -1,
      minHeightDiff = Infinity;
    
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
   * @param {number} componentId
   * @param {MouseEvent} event
   * @private
   */
  _handleMouseDown(componentId, event) {
    if (componentId !== this.props.rootComponentId)
      this.props.onStartDragExistingComponent(event, componentId);
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
    const component = this.props.components.get(componentId);

    const indexOfLine = component.children
      ? component.children.indexOf(this.props.draggingOverComponentId)
      : -1;

    const willRenderLine =
      componentId === this.props.placeholderContainerId &&
      this.props.draggingComponent &&
      canInsertComponent(
        this.props.draggedComponents.get(
          this.props.draggedComponentId !== -1
            ? this.props.draggedComponentId
            : 0,
        ).name,
        component.name,
        component.children.map(
          childId => this.props.components.get(childId).name,
        ),
        indexOfLine,
        this.props.meta,
      );
    
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

    let title,
      subtitle;

    if (component.title) {
      title = component.title;
      subtitle = component.name;
    } else {
      title = component.name;
      subtitle = '';
    }
    
    const expanded =
      this.props.expandedItemIds.has(componentId) ||
      this.props.draggingComponent && (
        !this.isMouseOver ||
        componentId === this.props.rootComponentId
      );
    
    const hovered =
      this.props.highlightedComponentIds.has(componentId) ||
      willRenderLine;
    
    const active = this.props.selectedComponentIds.has(componentId);

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
    let children = componentIds.map(this._renderItem);
    
    if (showLine && this.props.draggingOverPlaceholder) {
      let indexOfLinePlaceholder = 0;
      
      if (indexOfLine !== -1) {
        indexOfLinePlaceholder = indexOfLine;
        if (this.props.placeholderAfter >= indexOfLine)
          indexOfLinePlaceholder += 1;
      } else if (this.props.placeholderAfter !== -1) {
        indexOfLinePlaceholder = this.props.placeholderAfter;
      }
  
      children = children.insert(
        indexOfLinePlaceholder,
        this._renderLine(),
      );
    }

    //noinspection JSValidateTypes
    return (
      <ComponentsTreeList>
        {children}
      </ComponentsTreeList>
    );
  }

  render() {
    const { getLocalizedText } = this.props;

    if (this.props.rootComponentId === -1) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('thereAreNoComponentsInThisRoute')}
        />
      );
    }
    
    const list = this._renderList(List([this.props.rootComponentId]));

    return (
      <BlockContentBox
        createElementRef={this._createElementRef}
        onMouseUp={this._handleMouseUp}
        autoScrollUpDown={this.props.draggingComponent}
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
  ).isRequired,
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
  timeToExpand: 1000,
  borderPixels: 4,
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
