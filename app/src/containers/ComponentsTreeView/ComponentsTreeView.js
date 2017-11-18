/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Portal from 'react-portal-minimal';
import { Shortcuts } from 'react-shortcuts';
import throttle from 'lodash.throttle';

import {
  BlockContentBox,
  BlockContentPlaceholder,
} from '@jssy/common-ui';

import {
  ComponentDataSelect,
} from '../ComponentDataSelect/ComponentDataSelect';

import {
  ComponentsTree,
  ComponentsTreeItem,
  ComponentsTreeItemTitle,
  ComponentsTreeItemContent,
  ComponentsTreeList,
  ComponentsTreeCursor,
} from '../../components/ComponentsTree/ComponentsTree';

import {
  ComponentPlaceholder,
} from '../../components/ComponentPlaceholder/ComponentPlaceholder';

import draggable from '../../hocs/draggable';
import dropZone from '../../hocs/dropZone';

import {
  connectDraggable,
  connectDropZone,
} from '../ComponentsDragArea/ComponentsDragArea';

import {
  expandTreeItem,
  collapseTreeItem,
} from '../../actions/design';

import {
  selectPreviewComponent,
  deselectPreviewComponent,
  highlightPreviewComponent,
  unhighlightPreviewComponent,
  dragOverPlaceholder,
  dragOverNothing,
  startDragExistingComponent,
  ComponentDropAreas,
} from '../../actions/preview';

import {
  pickComponentDone,
  pickComponentDataDone,
  moveCursor,
  ComponentPickAreas,
} from '../../actions/project';

import {
  currentComponentsSelector,
  currentRootComponentIdSelector,
  selectedComponentIdsSelector,
  highlightedComponentIdsSelector,
  getLocalizedTextFromState,
  rootDraggedComponentSelector,
  cursorPositionSelector,
  expandedTreeItemIdsSelector,
} from '../../selectors';

import ProjectComponentRecord from '../../models/ProjectComponent';
import { isCompositeComponent, isAtomicComponent } from '../../lib/meta';

import {
  isRootComponent,
  canInsertComponent,
  canInsertComponentIntoTree,
  formatComponentTitle,
} from '../../lib/components';

import { isFunction } from '../../utils/misc';
import * as JssyPropTypes from '../../constants/common-prop-types';
import { INVALID_ID } from '../../constants/misc';
import { DND_DRAG_START_RADIUS_TREE } from '../../config';

const propTypes = {
  dropZoneId: PropTypes.string,
  components: JssyPropTypes.components.isRequired, // state
  rootComponentId: PropTypes.number.isRequired, // state
  selectedComponentIds: JssyPropTypes.setOfIds.isRequired, // state
  highlightedComponentIds: JssyPropTypes.setOfIds.isRequired, // state
  expandedItemIds: JssyPropTypes.setOfIds.isRequired, // state
  draggingComponent: PropTypes.bool.isRequired, // state
  rootDraggedComponent: PropTypes.instanceOf(ProjectComponentRecord), // state
  draggingOverPlaceholder: PropTypes.bool.isRequired, // state
  placeholderContainerId: PropTypes.number.isRequired, // state
  placeholderAfter: PropTypes.number.isRequired, // state
  pickingComponent: PropTypes.bool.isRequired, // state
  pickingComponentData: PropTypes.bool.isRequired, // state
  pickingComponentFilter: PropTypes.func, // state
  pickedComponentId: PropTypes.number.isRequired, // state
  pickedComponentArea: PropTypes.number.isRequired, // state
  componentDataListIsVisible: PropTypes.bool.isRequired, // state
  componentDataListItems: PropTypes.arrayOf(
    JssyPropTypes.componentDataItem,
  ).isRequired, // state
  meta: PropTypes.object.isRequired, // state
  cursorPosition: JssyPropTypes.componentsTreePosition.isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onExpandItem: PropTypes.func.isRequired, // dispatch
  onCollapseItem: PropTypes.func.isRequired, // dispatch
  onSelectItem: PropTypes.func.isRequired, // dispatch
  onDeselectItem: PropTypes.func.isRequired, // dispatch
  onHighlightItem: PropTypes.func.isRequired, // dispatch
  onUnhighlightItem: PropTypes.func.isRequired, // dispatch
  onDragOverPlaceholder: PropTypes.func.isRequired, // dispatch
  onDragOverNothing: PropTypes.func.isRequired, // dispatch
  onDropZoneReady: PropTypes.func.isRequired, // dispatch
  onDropZoneRemove: PropTypes.func.isRequired, // dispatch
  onDropZoneSnap: PropTypes.func.isRequired, // dispatch
  onDropZoneUnsnap: PropTypes.func.isRequired, // dispatch
  onStartDragComponent: PropTypes.func.isRequired, // dispatch
  onPickComponent: PropTypes.func.isRequired, // dispatch
  onSelectComponentData: PropTypes.func.isRequired, // dispatch
  onMoveCursor: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {
  dropZoneId: ComponentDropAreas.TREE,
  rootDraggedComponent: null,
  pickingComponentFilter: null,
};

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  rootComponentId: currentRootComponentIdSelector(state),
  selectedComponentIds: selectedComponentIdsSelector(state),
  highlightedComponentIds: highlightedComponentIdsSelector(state),
  expandedItemIds: expandedTreeItemIdsSelector(state),
  draggingComponent: state.project.draggingComponent,
  rootDraggedComponent: rootDraggedComponentSelector(state),
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  pickingComponent: state.project.pickingComponent,
  pickingComponentData: state.project.pickingComponentData,
  pickingComponentFilter: state.project.pickingComponentFilter,
  pickedComponentId: state.project.pickedComponentId,
  pickedComponentArea: state.project.pickedComponentArea,
  componentDataListIsVisible: state.project.componentDataListIsVisible,
  componentDataListItems: state.project.componentDataListItems,
  language: state.project.languageForComponentProps,
  meta: state.project.meta,
  cursorPosition: cursorPositionSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onExpandItem: id =>
    void dispatch(expandTreeItem(id)),
  
  onCollapseItem: id =>
    void dispatch(collapseTreeItem(id)),
  
  onSelectItem: id =>
    void dispatch(selectPreviewComponent(id, true, false, false)),
  
  onDeselectItem: id =>
    void dispatch(deselectPreviewComponent(id)),
  
  onHighlightItem: id =>
    void dispatch(highlightPreviewComponent(id)),
  
  onUnhighlightItem: id =>
    void dispatch(unhighlightPreviewComponent(id)),
  
  onDragOverPlaceholder: (id, afterIdx) =>
    void dispatch(dragOverPlaceholder(id, afterIdx)),
  
  onDragOverNothing: () =>
    void dispatch(dragOverNothing()),
  
  onStartDragComponent: componentId =>
    void dispatch(startDragExistingComponent(componentId)),
  
  onPickComponent: componentId =>
    void dispatch(pickComponentDone(componentId, ComponentPickAreas.TREE)),

  onSelectComponentData: ({ data }) =>
    void dispatch(pickComponentDataDone(data)),

  onMoveCursor: (containerId, afterIdx) =>
    void dispatch(moveCursor(containerId, afterIdx)),
});

const wrap = compose(
  connect(mapStateToProps, mapDispatchToProps),
  connectDropZone,
  dropZone,
);

/**
 *
 * @type {Object<string, number>}
 */
const CursorPositions = {
  NA: -1,
  TOP: 0,
  MIDDLE: 1,
  BOTTOM: 2,
};

const BORDER_PIXELS = 4;
const EXPAND_ON_DRAG_OVER_DELAY = 500;
const MAX_HEIGHT_DIFF = 100;

/**
 *
 * @param {number} pageY
 * @param {HTMLElement} element
 * @param {number} borderPixels
 * @return {{ position: number, middlePosition: number }}
 */
const calcCursorPosition = (pageY, element, borderPixels) => {
  const { top, bottom } = element.getBoundingClientRect();
  
  const ret = {
    position: CursorPositions.NA,
    middlePosition: CursorPositions.NA,
  };
  
  if (pageY < bottom && pageY > top) {
    const fromTop = pageY - top;
    const fromBottom = bottom - pageY;
    
    if (fromTop <= borderPixels) ret.position = CursorPositions.TOP;
    else if (fromBottom <= borderPixels) ret.position = CursorPositions.BOTTOM;
    else ret.position = CursorPositions.MIDDLE;
    
    if (fromTop > fromBottom) ret.middlePosition = CursorPositions.BOTTOM;
    else ret.middlePosition = CursorPositions.TOP;
  } else {
    ret.position = pageY - top < 0
      ? CursorPositions.TOP
      : CursorPositions.BOTTOM;
  }
  
  return ret;
};

const DraggableComponentItemContent =
  connectDraggable(draggable(ComponentsTreeItemContent));

const DRAG_THROTTLE = 100;

class ComponentsTreeViewComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._contentBoxElement = null;
    this._clickListenerIsSet = false;
    this._lineElement = null;
    this._itemElements = new Map();
    this._dropZoneIsReady = false;
    this._expandTimeout = null;
    this._componentIdToExpand = INVALID_ID;

    this.state = {
      isDraggingOnTree: false,
    };

    this._renderItem = this._renderItem.bind(this);
    this._handleShortcuts = this._handleShortcuts.bind(this);
    this._handleNativeClick = this._handleNativeClick.bind(this);
    this._handleExpand = this._handleExpand.bind(this);
    this._handleSelect = this._handleSelect.bind(this);
    this._handleHover = this._handleHover.bind(this);
    this._handleDragEnter = this._handleDragEnter.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleDrag = throttle(this._handleDrag.bind(this), DRAG_THROTTLE);
    this._handleComponentDragStart = this._handleComponentDragStart.bind(this);
    this._saveContentBoxRef = this._saveContentBoxRef.bind(this);
    this._saveItemRef = this._saveItemRef.bind(this);
    this._saveLineRef = this._saveLineRef.bind(this);
    this._expandComponent = this._expandComponent.bind(this);
    this._expandComponentAfterTime = this._expandComponentAfterTime.bind(this);
    this._clearExpandTimeout = this._clearExpandTimeout.bind(this);
  }
  
  componentDidMount() {
    if (this._treeIsVisible()) this._dropZoneReady();
    
    if (this._contentBoxElement) {
      this._contentBoxElement.addEventListener(
        'click',
        this._handleNativeClick,
      );
      
      this._clickListenerIsSet = true;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.draggingComponent) {
      this.setState({
        isDraggingOnTree: false,
      });
    }
  }

  componentDidUpdate() {
    const { draggingOverPlaceholder, onDropZoneUnsnap } = this.props;
    const { isDraggingOnTree } = this.state;

    if (this._treeIsVisible()) {
      if (!this._dropZoneIsReady) this._dropZoneReady();
    } else if (this._dropZoneIsReady) {
      this._dropZoneRemoved();
    }
    
    if (isDraggingOnTree) {
      if (draggingOverPlaceholder) this._snapToLineElement();
      else onDropZoneUnsnap();
    }
  
    if (this._contentBoxElement) {
      if (!this._clickListenerIsSet) {
        this._contentBoxElement.addEventListener(
          'click',
          this._handleNativeClick,
        );
  
        this._clickListenerIsSet = true;
      }
    } else {
      this._clickListenerIsSet = false;
    }
  }
  
  /**
   *
   * @private
   */
  _dropZoneReady() {
    const { dropZoneId, onDropZoneReady } = this.props;
    
    onDropZoneReady({
      id: dropZoneId,
      element: this._contentBoxElement,
      onEnter: this._handleDragEnter,
      onLeave: this._handleDragLeave,
      onDrag: this._handleDrag,
    });
  
    this._dropZoneIsReady = true;
  }
  
  /**
   *
   * @private
   */
  _dropZoneRemoved() {
    const { dropZoneId, onDropZoneRemove } = this.props;
    
    onDropZoneRemove({ id: dropZoneId });
    this._dropZoneIsReady = false;
  }
  
  /**
   *
   * @private
   */
  _snapToLineElement() {
    const { dropZoneId, onDropZoneSnap } = this.props;
    if (!this._lineElement) return;
    const lineRect = this._lineElement.getBoundingClientRect();
    const boxRect = this._contentBoxElement.getBoundingClientRect();
  
    onDropZoneSnap({
      dropZoneId,
      element: this._lineElement,
      x: lineRect.left - boxRect.left,
      y: lineRect.top - boxRect.top,
      width: lineRect.width,
      height: lineRect.height,
      hideTitle: false,
    });
  }

  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _saveContentBoxRef(ref) {
    this._contentBoxElement = ref;
  }

  /**
   *
   * @param {number} componentId
   * @param {HTMLElement} ref
   * @private
   */
  _saveItemRef({ componentId, ref }) {
    this._itemElements.set(componentId, ref);
  }
  
  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _saveLineRef(ref) {
    this._lineElement = ref;
  }
  
  /**
   *
   * @param {number} containerId
   * @param {number} afterIdx
   * @private
   */
  _updatePlaceholderPosition(containerId, afterIdx) {
    const {
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
      onDragOverPlaceholder,
    } = this.props;
    
    const positionChanged =
      !draggingOverPlaceholder ||
      containerId !== placeholderContainerId ||
      afterIdx !== placeholderAfter;
  
    if (positionChanged) {
      onDragOverPlaceholder(containerId, afterIdx);
    }
  }
  
  /**
   *
   * @private
   */
  _removePlaceholder() {
    const { draggingOverPlaceholder, onDragOverNothing } = this.props;
    if (draggingOverPlaceholder) onDragOverNothing();
  }
  
  /**
   *
   * @param {number} containerId
   * @param {number} afterIdx
   * @private
   */
  _tryUpdatePlaceholder(containerId, afterIdx) {
    const { meta, components, rootDraggedComponent } = this.props;
    
    const canInsert = canInsertComponent(
      rootDraggedComponent.name,
      components,
      containerId,
      afterIdx,
      meta,
    );
    
    if (canInsert) this._updatePlaceholderPosition(containerId, afterIdx);
    else this._removePlaceholder();
  }
  
  /**
   *
   * @param {string} action
   * @private
   */
  _handleShortcuts(action) {
    switch (action) {
      case 'SELECT_NEXT_COMPONENT': {
        this._handleMoveSelectionVertically('down');
        break;
      }
      
      case 'SELECT_PREVIOUS_COMPONENT': {
        this._handleMoveSelectionVertically('up');
        break;
      }
      
      case 'SELECT_CHILD_COMPONENT': {
        this._handleSelectChildComponent();
        break;
      }
      
      case 'SELECT_PARENT_COMPONENT': {
        this._handleSelectParentComponent();
        break;
      }

      case 'MOVE_CURSOR_DOWN': {
        this._handleMoveCursorDown();
        break;
      }

      case 'MOVE_CURSOR_UP': {
        this._handleMoveCursorUp();
        break;
      }

      case 'MOVE_CURSOR_OUTSIDE': {
        this._handleMoveCursorOutside();
        break;
      }

      case 'MOVE_CURSOR_INTO': {
        this._handleMoveCursorInto();
        break;
      }
      
      default:
    }
  }
  
  /**
   *
   * @param {string} direction - 'up' or 'down'
   * @private
   */
  _handleMoveSelectionVertically(direction) {
    const { components, selectedComponentIds, onSelectItem } = this.props;
    
    if (selectedComponentIds.size !== 1) return;
    
    const selectedComponentId = selectedComponentIds.first();
    const selectedComponent = components.get(selectedComponentId);
    
    if (isRootComponent(selectedComponent)) return;
    
    const parentComponent = components.get(selectedComponent.parentId);
    const position = parentComponent.children.indexOf(selectedComponentId);
    const nextPosition = direction === 'down' ? position + 1 : position - 1;
    
    if (
      nextPosition < 0 ||
      nextPosition > parentComponent.children.size - 1
    ) {
      return;
    }
  
    const nextComponentId = parentComponent.children.get(nextPosition);
    onSelectItem(nextComponentId);
  }
  
  /**
   *
   * @private
   */
  _handleSelectChildComponent() {
    const {
      components,
      selectedComponentIds,
      expandedItemIds,
      onSelectItem,
      onExpandItem,
    } = this.props;
  
    if (selectedComponentIds.size !== 1) return;
  
    const selectedComponentId = selectedComponentIds.first();
    const selectedComponent = components.get(selectedComponentId);
    
    if (selectedComponent.children.size === 0) return;
  
    if (!expandedItemIds.has(selectedComponentId)) {
      onExpandItem(selectedComponentId);
    }
    
    onSelectItem(selectedComponent.children.first());
  }
  
  /**
   *
   * @private
   */
  _handleSelectParentComponent() {
    const { components, selectedComponentIds, onSelectItem } = this.props;
  
    if (selectedComponentIds.size !== 1) return;
  
    const selectedComponentId = selectedComponentIds.first();
    const selectedComponent = components.get(selectedComponentId);
  
    if (isRootComponent(selectedComponent)) return;
  
    onSelectItem(selectedComponent.parentId);
  }

  /**
   *
   * @private
   */
  _handleMoveCursorDown() {
    const { components, cursorPosition, onMoveCursor } = this.props;

    if (cursorPosition.containerId === INVALID_ID) return;

    const containerComponent = components.get(cursorPosition.containerId);
    const nextCursorAfter = cursorPosition.afterIdx + 1;

    if (nextCursorAfter < containerComponent.children.size) {
      onMoveCursor(cursorPosition.containerId, nextCursorAfter);
    }
  }

  /**
   *
   * @private
   */
  _handleMoveCursorUp() {
    const { cursorPosition, onMoveCursor } = this.props;

    if (cursorPosition.containerId === INVALID_ID) return;

    const nextCursorAfter = cursorPosition.afterIdx - 1;

    if (nextCursorAfter >= -1) {
      onMoveCursor(cursorPosition.containerId, nextCursorAfter);
    }
  }

  /**
   *
   * @private
   */
  _handleMoveCursorOutside() {
    const { components, cursorPosition, onMoveCursor } = this.props;

    if (cursorPosition.containerId === INVALID_ID) return;

    const containerComponent = components.get(cursorPosition.containerId);
    if (isRootComponent(containerComponent)) return;

    const parentComponent = components.get(containerComponent.parentId);
    const containerPosition =
      parentComponent.children.indexOf(parentComponent.id);

    onMoveCursor(parentComponent.id, containerPosition);
  }

  /**
   *
   * @private
   */
  _handleMoveCursorInto() {
    const {
      meta,
      components,
      cursorPosition,
      expandedItemIds,
      onMoveCursor,
      onExpandItem,
    } = this.props;

    if (cursorPosition.containerId === INVALID_ID) return;

    const containerComponent = components.get(cursorPosition.containerId);

    if (cursorPosition.afterIdx >= containerComponent.children.size - 1) {
      return;
    }

    const targetComponentId =
      containerComponent.children.get(cursorPosition.afterIdx + 1);

    const targetComponent = components.get(targetComponentId);

    if (!isAtomicComponent(targetComponent.name, meta)) {
      if (!expandedItemIds.has(targetComponentId)) {
        onExpandItem(targetComponentId);
      }
      
      onMoveCursor(targetComponentId, -1);
    }
  }
  
  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleNativeClick(event) {
    const { pickingComponent } = this.props;
    if (pickingComponent) event.stopPropagation();
  }

  /**
   *
   * @private
   */
  _handleDragEnter() {
    this.setState({
      isDraggingOnTree: true,
    });
  }

  /**
   *
   * @private
   */
  _handleDragLeave() {
    this.setState({
      isDraggingOnTree: false,
    });
  }

  /**
   *
   * @param {number} pageY
   * @private
   */
  _handleDrag({ pageY }) {
    const {
      meta,
      components,
      rootDraggedComponent,
      draggingOverPlaceholder,
      expandedItemIds,
      onDragOverNothing,
    } = this.props;

    const { isDraggingOnTree } = this.state;

    // Like in Preview, _handleDrag is throttled,
    // so we check if we're still dragging over the tree
    if (!isDraggingOnTree) return;
    
    const componentId = this._getClosestItemComponentId(pageY);

    if (componentId === INVALID_ID) {
      if (draggingOverPlaceholder) onDragOverNothing();
      return;
    }

    const component = components.get(componentId);
    const parentId = component.parentId;
    const isRootComponent = parentId === INVALID_ID;
    const parentComponent = isRootComponent ? null : components.get(parentId);
    const element = this._itemElements.get(componentId);
    const {
      position,
      middlePosition,
    } = calcCursorPosition(pageY, element, BORDER_PIXELS);
    
    const componentPosition = isRootComponent
      ? 0
      : parentComponent.children.indexOf(componentId);
    
    if (position === CursorPositions.TOP) {
      if (isRootComponent) this._removePlaceholder();
      else this._tryUpdatePlaceholder(parentId, componentPosition - 1);
    } else if (position === CursorPositions.MIDDLE) {
      const alreadyExpanded = expandedItemIds.has(componentId);
      
      if (alreadyExpanded) {
        this._tryUpdatePlaceholder(componentId, INVALID_ID);
      } else {
        const expandAlreadyScheduled =
          !!this._expandTimeout &&
          componentId === this._componentIdToExpand;
  
        if (!expandAlreadyScheduled) {
          const canInsertIntoSubtree = canInsertComponentIntoTree(
            rootDraggedComponent.name,
            components,
            componentId,
            meta,
          );
    
          if (canInsertIntoSubtree) {
            if (this._expandTimeout) this._clearExpandTimeout();
      
            this._expandComponentAfterTime(
              componentId,
              EXPAND_ON_DRAG_OVER_DELAY,
            );
          } else if (middlePosition === CursorPositions.TOP) {
            if (isRootComponent) this._removePlaceholder();
            else this._tryUpdatePlaceholder(parentId, componentPosition - 1);
          } else if (position === CursorPositions.BOTTOM) {
            if (isRootComponent) this._removePlaceholder();
            else this._tryUpdatePlaceholder(parentId, componentPosition);
          }
        }
      }
    } else if (position === CursorPositions.BOTTOM) {
      if (isRootComponent) this._removePlaceholder();
      else this._tryUpdatePlaceholder(parentId, componentPosition);
    }
  }

  /**
   *
   * @param {number} componentId
   * @param {boolean} expanded
   * @private
   */
  _handleExpand({ componentId, expanded }) {
    const { onExpandItem, onCollapseItem } = this.props;

    if (expanded) onExpandItem(componentId);
    else onCollapseItem(componentId);
  }

  /**
   *
   * @param {number} componentId
   * @param {boolean} selected
   * @private
   */
  _handleSelect({ componentId, selected }) {
    const {
      pickingComponent,
      pickingComponentData,
      onSelectItem,
      onDeselectItem,
      onPickComponent,
    } = this.props;
    
    if (pickingComponent) {
      onPickComponent(componentId);
    } else if (!pickingComponentData) {
      if (selected) onSelectItem(componentId);
      else onDeselectItem(componentId);
    }
  }

  /**
   *
   * @param {number} componentId
   * @param {boolean} hovered
   * @private
   */
  _handleHover({ componentId, hovered }) {
    const {
      draggingComponent,
      onHighlightItem,
      onUnhighlightItem,
    } = this.props;

    if (hovered && !draggingComponent) onHighlightItem(componentId);
    else onUnhighlightItem(componentId);
  }
  
  /**
   *
   * @param {Object} data
   * @param {number} data.componentId
   * @private
   */
  _handleComponentDragStart({ data }) {
    const { onStartDragComponent } = this.props;
    onStartDragComponent(data.componentId);
  }
  
  /**
   *
   * @private
   */
  _expandComponent() {
    const {
      draggingComponent,
      expandedItemIds,
      onExpandItem,
    } = this.props;
    
    const componentId = this._componentIdToExpand;
    if (!draggingComponent || expandedItemIds.has(componentId)) return;
    
    onExpandItem(componentId);
    this._expandTimeout = null;
    this._componentIdToExpand = INVALID_ID;
  }
  
  /**
   *
   * @param {number} componentId
   * @param {number} time
   * @private
   */
  _expandComponentAfterTime(componentId, time) {
    this._componentIdToExpand = componentId;
    this._expandTimeout = setTimeout(this._expandComponent, time);
  }

  /**
   *
   * @private
   */
  _clearExpandTimeout() {
    clearTimeout(this._expandTimeout);
    this._expandTimeout = null;
    this._componentIdToExpand = INVALID_ID;
  }
  
  /**
   *
   * @param {number} pageY
   * @return {number}
   * @private
   */
  _getClosestItemComponentId(pageY) {
    let closestItemComponentId = INVALID_ID;
    let minHeightDiff = Infinity;
    this._itemElements.forEach((ref, componentId) => {
      if (!ref) return;
      
      const { top, bottom } = ref.getBoundingClientRect();
      
      const heightDiff = Math.min(
        Math.abs(pageY - top),
        Math.abs(pageY - bottom),
      );
      
      if (heightDiff > MAX_HEIGHT_DIFF) return;
      
      if (heightDiff < minHeightDiff) {
        minHeightDiff = heightDiff;
        closestItemComponentId = componentId;
      }
    });
    
    return closestItemComponentId;
  }
  
  /**
   *
   * @return {boolean}
   * @private
   */
  _treeIsVisible() {
    const { rootComponentId } = this.props;
    return rootComponentId !== INVALID_ID;
  }
  
  /**
   *
   * @param {string} [title='']
   * @param {boolean} [invisible=false]
   * @return {ReactElement}
   * @private
   */
  _renderLine(title = '', invisible = false) {
    return (
      <ComponentPlaceholder
        key="divider-line"
        isPlaced
        isInvisible={invisible}
        title={title}
        elementRef={this._saveLineRef}
      />
    );
  }
  
  /**
   *
   * @param {number} componentId
   * @return {ReactElement}
   * @private
   */
  _renderItem(componentId) {
    const {
      meta,
      components,
      highlightedComponentIds,
      selectedComponentIds,
      expandedItemIds,
      draggingOverPlaceholder,
      placeholderContainerId,
      pickingComponent,
      pickingComponentData,
      pickingComponentFilter,
    } = this.props;
    
    const component = components.get(componentId);

    let title;
    if (component.title) {
      title = component.title;
    } else {
      title = component.name;
    }

    
    let expanded = expandedItemIds.has(componentId);
    if (!expanded && draggingOverPlaceholder) {
      let currentId = placeholderContainerId;
      while (currentId !== INVALID_ID && !expanded) {
        if (currentId === componentId) expanded = true;
        currentId = components.get(currentId).parentId;
      }
    }

    let hovered = false;
    const highlightedComponentId = highlightedComponentIds.first();
    if (highlightedComponentId) {
      let currentID = highlightedComponentId;
      while (!expandedItemIds.has(currentID)) {
        if (currentID !== INVALID_ID) {
          const parentId = components.get(currentID).parentId;
          if (currentID === componentId) hovered = true;
          currentID = parentId;
        }
      }
    }
    
    const active =
      !pickingComponent &&
      !pickingComponentData &&
      selectedComponentIds.has(componentId);
    
    const dragData = { componentId };
    const subLevel = this._renderList(componentId);
    const isRootComponent = component.parentId === INVALID_ID;
    const parentComponent = isRootComponent
      ? null
      : components.get(component.parentId);
    
    const isDraggable =
      active &&
      selectedComponentIds.size === 1 &&
      !isRootComponent &&
      !isCompositeComponent(parentComponent.name, meta);
    
    const disabled =
      (pickingComponent || pickingComponentData) &&
      isFunction(pickingComponentFilter) &&
      !pickingComponentFilter(componentId);
    
    const titleElement = (
      <ComponentsTreeItemTitle
        title={title}
      />
    );

    const hasSubLevel = !!subLevel;

    return (
      <ComponentsTreeItem
        key={String(componentId)}
      >
        <DraggableComponentItemContent
          key={String(componentId)}
          componentId={componentId}
          expanded={expanded}
          itemElement={titleElement}
          onExpand={this._handleExpand}
          disabled={disabled}
          active={active}
          hovered={hovered}
          hasSubLevel={hasSubLevel}
          dragEnable={isDraggable}
          dragStartRadius={DND_DRAG_START_RADIUS_TREE}
          dragTitle={title}
          dragData={dragData}
          elementRef={this._saveItemRef}
          onSelect={this._handleSelect}
          onHover={this._handleHover}
          onDragStart={this._handleComponentDragStart}
        />
        { expanded && subLevel}
      </ComponentsTreeItem>
    );
  }

  /**
   *
   * @param {number} containerId
   * @param {number} afterIdx
   * @return {?ReactElement}
   * @private
   */
  _renderSnapBlockOrPlaceholder(containerId, afterIdx) {
    const {
      rootDraggedComponent,
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
    } = this.props;

    const { isDraggingOnTree } = this.state;

    const willRenderPlaceholder =
      draggingOverPlaceholder &&
      placeholderContainerId === containerId &&
      placeholderAfter === afterIdx;

    if (willRenderPlaceholder) {
      const title = formatComponentTitle(rootDraggedComponent);
      return this._renderLine(title, isDraggingOnTree);
    }

    return null;
  }
  
  /**
   *
   * @param {number} parentComponentId
   * @return {ReactElement}
   * @private
   */
  _renderList(parentComponentId) {
    const {
      components,
      rootComponentId,
      draggingComponent,
      rootDraggedComponent,
      cursorPosition,
      getLocalizedText,
    } = this.props;

    const componentIds = parentComponentId !== INVALID_ID
      ? components.get(parentComponentId).children
      : [rootComponentId];

    const children = [];
    let gotDraggedComponent = false;

    if (
      cursorPosition.containerId === parentComponentId &&
      cursorPosition.afterIdx === -1
    ) {
      children.push(
        <ComponentsTreeCursor
          key="cursor"
          tooltipText={getLocalizedText('tree.cursorTooltip')}
        />,
      );
    }

    componentIds.forEach((componentId, idx) => {
      if (draggingComponent) {
        if (
          !rootDraggedComponent.isNew &&
          componentId === rootDraggedComponent.id
        ) {
          gotDraggedComponent = true;
          return;
        }
        
        const afterIdx = gotDraggedComponent ? idx - 2 : idx - 1;
        
        const snapPointOrPlaceholder =
          this._renderSnapBlockOrPlaceholder(parentComponentId, afterIdx);

        if (snapPointOrPlaceholder) {
          children.push(snapPointOrPlaceholder);
        }
      }

      children.push(this._renderItem(componentId));

      if (
        cursorPosition.containerId === parentComponentId &&
        cursorPosition.afterIdx === idx
      ) {
        children.push(
          <ComponentsTreeCursor
            key="cursor"
            tooltipText={getLocalizedText('tree.cursorTooltip')}
          />,
        );
      }
    });

    if (draggingComponent) {
      const afterIdx = gotDraggedComponent
        ? componentIds.size - 2
        : componentIds.size - 1;
      
      const snapPointOrPlaceholder = this._renderSnapBlockOrPlaceholder(
        parentComponentId,
        afterIdx,
      );

      if (snapPointOrPlaceholder) {
        children.push(snapPointOrPlaceholder);
      }
    }

    if (!children.length) return null;

    return (
      <ComponentsTreeList>
        {children}
      </ComponentsTreeList>
    );
  }

  _renderComponentDataSelect() {
    const {
      pickedComponentId,
      componentDataListItems,
      getLocalizedText,
      onSelectComponentData,
    } = this.props;

    const itemElement = this._itemElements.get(pickedComponentId);
    if (!itemElement) return null;

    const { left, top } = itemElement.getBoundingClientRect();

    const wrapperStyle = {
      position: 'absolute',
      zIndex: '1000',
      left: `${left}px`,
      top: `${top}px`,
    };

    return (
      <Portal>
        <div style={wrapperStyle}>
          <ComponentDataSelect
            componentDataItems={componentDataListItems}
            getLocalizedText={getLocalizedText}
            onSelect={onSelectComponentData}
          />
        </div>
      </Portal>
    );
  }

  render() {
    const {
      draggingComponent,
      componentDataListIsVisible,
      pickedComponentArea,
      getLocalizedText,
    } = this.props;

    if (!this._treeIsVisible()) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('tree.noComponents')}
        />
      );
    }
    
    const list = this._renderList(INVALID_ID);

    const willRenderComponentDataSelect =
      componentDataListIsVisible &&
      pickedComponentArea === ComponentPickAreas.TREE;

    const componentDataSelect = willRenderComponentDataSelect
      ? this._renderComponentDataSelect()
      : null;

    return (
      <BlockContentBox
        isBordered
        flex
        elementRef={this._saveContentBoxRef}
        autoScrollUpDown={draggingComponent}
      >
        <Shortcuts
          name="COMPONENTS_TREE"
          handler={this._handleShortcuts} // eslint-disable-line react/jsx-handler-names
          targetNodeSelector="body"
        >
          <ComponentsTree>
            {list}
          </ComponentsTree>
        </Shortcuts>

        {componentDataSelect}
      </BlockContentBox>
    );
  }
}

ComponentsTreeViewComponent.propTypes = propTypes;
ComponentsTreeViewComponent.defaultProps = defaultProps;
ComponentsTreeViewComponent.displayName = 'ComponentsTreeView';

export const ComponentsTreeView = wrap(ComponentsTreeViewComponent);
