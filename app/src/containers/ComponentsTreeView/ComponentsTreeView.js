/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import throttle from 'lodash.throttle';

import {
  ComponentsTree,
  ComponentsTreeItem,
  ComponentsTreeItemTitle,
  ComponentsTreeList,
} from '../../components/ComponentsTree/ComponentsTree';

import {
  ComponentPlaceholder,
} from '../../components/ComponentPlaceholder/ComponentPlaceholder';

import {
  BlockContentBox,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

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
  currentComponentsSelector,
  currentRootComponentIdSelector,
  currentSelectedComponentIdsSelector,
  currentHighlightedComponentIdsSelector,
  getLocalizedTextFromState,
} from '../../selectors';

import ProjectComponentRecord from '../../models/ProjectComponent';
import { canInsertComponent, isCompositeComponent } from '../../utils/meta';
import { INVALID_ID } from '../../constants/misc';

const propTypes = {
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
  draggingOverPlaceholder: PropTypes.bool.isRequired,
  placeholderContainerId: PropTypes.number.isRequired,
  placeholderAfter: PropTypes.number.isRequired,
  meta: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  dropZoneId: PropTypes.string.isRequired,
  onExpandItem: PropTypes.func.isRequired,
  onCollapseItem: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  onDeselectItem: PropTypes.func.isRequired,
  onHighlightItem: PropTypes.func.isRequired,
  onUnhighlightItem: PropTypes.func.isRequired,
  onDragOverPlaceholder: PropTypes.func.isRequired,
  onDragOverNothing: PropTypes.func.isRequired,
  onDropZoneReady: PropTypes.func.isRequired,
  onDropZoneRemove: PropTypes.func.isRequired,
  onDropZoneSnap: PropTypes.func.isRequired,
  onDropZoneUnsnap: PropTypes.func.isRequired,
  onStartDragComponent: PropTypes.func.isRequired,
};

const defaultProps = {
  draggedComponents: null,
};

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  rootComponentId: currentRootComponentIdSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
  expandedItemIds: state.project.treeExpandedItemIds,
  draggingComponent: state.project.draggingComponent,
  draggedComponentId: state.project.draggedComponentId,
  draggedComponents: state.project.draggedComponents,
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  meta: state.project.meta,
  getLocalizedText: getLocalizedTextFromState(state),
  dropZoneId: ComponentDropAreas.TREE,
});

const mapDispatchToProps = dispatch => ({
  onExpandItem: id =>
    void dispatch(expandTreeItem(id)),
  
  onCollapseItem: id =>
    void dispatch(collapseTreeItem(id)),
  
  onSelectItem: id =>
    void dispatch(selectPreviewComponent(id, true, false)),
  
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
});

/**
 *
 * @type {Object<string, number>}
 */
const CursorPositions = {
  OUT: -1,
  TOP: 0,
  MIDDLE: 1,
  BOTTOM: 2,
};

const BORDER_PIXELS = 4;
const EXPAND_ON_DRAG_OVER_DELAY = 500;
const MAX_HEIGHT_DIFF = 100;

const canInsertComponentIntoTree = (component, components, rootId, meta) => {
  const rootComponent = components.get(rootId);
  const childNames = rootComponent.children
    .map(childId => components.get(childId).name);
  
  const canInsert = canInsertComponent(
    component.name,
    rootComponent.name,
    childNames,
    -1,
    meta,
  );
  
  if (canInsert) return true;
  
  return rootComponent.children.some(childId => canInsertComponentIntoTree(
    component,
    components,
    childId,
    meta,
  ));
};

/**
 *
 * @param {number} pageX
 * @param {number} pageY
 * @param {HTMLElement} element
 * @param {number} borderPixels
 * @return {number}
 */
const calcCursorPosition = (pageX, pageY, element, borderPixels) => {
  const { top, bottom, left, right } = element.getBoundingClientRect();
  
  if (pageX < left || pageX > right) return CursorPositions.OUT;
  
  if (pageY < bottom && pageY > top) {
    if (pageY - top <= borderPixels) return CursorPositions.TOP;
    if (bottom - pageY <= borderPixels) return CursorPositions.BOTTOM;
    return CursorPositions.MIDDLE;
  }
  
  return pageY - top < 0 ? CursorPositions.TOP : CursorPositions.BOTTOM;
};

const DraggableComponentTitle =
  connectDraggable(draggable(ComponentsTreeItemTitle));

class ComponentsTreeViewComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._contentBoxElement = null;
    this._lineElement = null;
    this._itemElements = new Map();
    this._dropZoneIsReady = false;
    this._expandTimeout = null;
    this._componentIdToExpand = INVALID_ID;

    this.state = {
      isDraggingOnTree: false,
    };

    this._renderItem = this._renderItem.bind(this);
    this._handleExpand = this._handleExpand.bind(this);
    this._handleSelect = this._handleSelect.bind(this);
    this._handleHover = this._handleHover.bind(this);
    this._handleDragEnter = this._handleDragEnter.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleDrag = throttle(this._handleDrag.bind(this), 100);
    this._handleComponentDragStart = this._handleComponentDragStart.bind(this);
    this._saveContentBoxRef = this._saveContentBoxRef.bind(this);
    this._saveItemRef = this._saveItemRef.bind(this);
    this._saveLineRef = this._saveLineRef.bind(this);
    this._expandComponent = this._expandComponent.bind(this);
    this._expandComponentAfterTime = this._expandComponentAfterTime.bind(this);
    this._clearExpandTimeout = this._clearExpandTimeout.bind(this);
  }
  
  componentDidMount() {
    const { dropZoneId, onDropZoneReady } = this.props;

    if (this._treeIsVisible()) {
      onDropZoneReady({
        id: dropZoneId,
        element: this._contentBoxElement,
        onEnter: this._handleDragEnter,
        onLeave: this._handleDragLeave,
        onDrag: this._handleDrag,
      });
      
      this._dropZoneIsReady = true;
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
    const {
      draggingOverPlaceholder,
      dropZoneId,
      onDropZoneReady,
      onDropZoneRemove,
      onDropZoneSnap,
      onDropZoneUnsnap,
    } = this.props;
    
    const { isDraggingOnTree } = this.state;

    if (this._treeIsVisible()) {
      if (!this._dropZoneIsReady) {
        onDropZoneReady({
          id: dropZoneId,
          element: this._contentBoxElement,
          onEnter: this._handleDragEnter,
          onLeave: this._handleDragLeave,
          onDrag: this._handleDrag,
        });

        this._dropZoneIsReady = true;
      }
    } else if (this._dropZoneIsReady) {
      onDropZoneRemove({ id: dropZoneId });
      this._dropZoneIsReady = false;
    }
    
    if (isDraggingOnTree) {
      if (draggingOverPlaceholder) {
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
      } else {
        onDropZoneUnsnap();
      }
    }
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
  
    if (positionChanged)
      onDragOverPlaceholder(containerId, afterIdx);
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
   * @param {number} position
   * @return {boolean}
   * @private
   */
  _canInsertDraggedComponent(containerId, position) {
    const {
      meta,
      components,
      draggedComponents,
      draggedComponentId,
    } = this.props;
    
    const rootDraggedComponentId =
      draggedComponentId === INVALID_ID ? 0 : draggedComponentId;
    
    const rootDraggedComponent =
      draggedComponents.get(rootDraggedComponentId);
    
    const container = components.get(containerId);
    const containerChildNames =
      container.children.map(childId => components.get(childId).name);
    
    return canInsertComponent(
      rootDraggedComponent.name,
      container.name,
      containerChildNames,
      position,
      meta,
    );
  }
  
  /**
   *
   * @param {number} containerId
   * @param {number} afterIdx
   * @private
   */
  _tryUpdatePlaceholder(containerId, afterIdx) {
    const canInsert =
      this._canInsertDraggedComponent(containerId, afterIdx + 1);
    
    if (canInsert) this._updatePlaceholderPosition(containerId, afterIdx);
    else this._removePlaceholder();
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
   * @param {number} pageX
   * @param {number} pageY
   * @private
   */
  _handleDrag({ pageX, pageY }) {
    const {
      meta,
      components,
      draggedComponents,
      draggedComponentId,
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
  
    const rootDraggedComponentId =
      draggedComponentId === INVALID_ID ? 0 : draggedComponentId;
  
    const rootDraggedComponent =
      draggedComponents.get(rootDraggedComponentId);

    const component = components.get(componentId);
    const parentId = component.parentId;
    const isRootComponent = parentId === INVALID_ID;
    const parentComponent = isRootComponent ? null : components.get(parentId);
    const componentPosition = isRootComponent
      ? 0
      : parentComponent.children.indexOf(componentId);

    const cursorPosition = calcCursorPosition(
      pageX,
      pageY,
      this._itemElements.get(componentId),
      BORDER_PIXELS,
    );
    
    if (cursorPosition === CursorPositions.TOP) {
      if (isRootComponent) this._removePlaceholder();
      else this._tryUpdatePlaceholder(parentId, componentPosition - 1);
    } else if (cursorPosition === CursorPositions.MIDDLE) {
      const alreadyExpanded = expandedItemIds.has(componentId);
      
      if (alreadyExpanded) {
        this._tryUpdatePlaceholder(componentId, INVALID_ID);
      } else {
        const expandAlreadyScheduled =
          !!this._expandTimeout &&
          componentId === this._componentIdToExpand;
  
        if (!expandAlreadyScheduled) {
          const willExpand = canInsertComponentIntoTree(
            rootDraggedComponent,
            components,
            componentId,
            meta,
          );
    
          if (willExpand) {
            if (this._expandTimeout) this._clearExpandTimeout();
      
            this._expandComponentAfterTime(
              componentId,
              EXPAND_ON_DRAG_OVER_DELAY,
            );
          }
        }
      }
    } else if (cursorPosition === CursorPositions.BOTTOM) {
      if (isRootComponent) this._removePlaceholder();
      else this._tryUpdatePlaceholder(parentId, componentPosition);
    } else if (cursorPosition === CursorPositions.OUT) {
      this._removePlaceholder();
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
    const { onSelectItem, onDeselectItem } = this.props;

    if (selected) onSelectItem(componentId);
    else onDeselectItem(componentId);
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
    //noinspection JSValidateTypes
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
    } = this.props;
    
    const component = components.get(componentId);

    let title;
    let subtitle;
    if (component.title) {
      title = component.title;
      subtitle = component.name;
    } else {
      title = component.name;
      subtitle = '';
    }
    
    let expanded = expandedItemIds.has(componentId);
    if (!expanded && draggingOverPlaceholder) {
      let currentId = placeholderContainerId;
      while (currentId !== INVALID_ID && !expanded) {
        if (currentId === componentId) expanded = true;
        currentId = components.get(currentId).parentId;
      }
    }

    const hovered = highlightedComponentIds.has(componentId);
    const active = selectedComponentIds.has(componentId);
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
    
    const titleElement = (
      <DraggableComponentTitle
        componentId={componentId}
        title={title}
        subtitle={subtitle}
        active={active}
        hovered={hovered}
        dragEnable={isDraggable}
        dragTitle={title}
        dragData={dragData}
        elementRef={this._saveItemRef}
        onSelect={this._handleSelect}
        onHover={this._handleHover}
        onDragStart={this._handleComponentDragStart}
      />
    );

    //noinspection JSValidateTypes
    return (
      <ComponentsTreeItem
        key={String(componentId)}
        componentId={componentId}
        expanded={expanded}
        itemElement={titleElement}
        onExpand={this._handleExpand}
      >
        {subLevel}
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
      draggedComponents,
      draggedComponentId,
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
      const rootDraggedComponentId =
        draggedComponentId !== INVALID_ID ? draggedComponentId : 0;
  
      const rootDraggedComponent =
        draggedComponents.get(rootDraggedComponentId);
  
      const title = rootDraggedComponent.title || rootDraggedComponent.name;
  
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
      draggedComponentId,
    } = this.props;

    const componentIds = parentComponentId !== INVALID_ID
      ? components.get(parentComponentId).children
      : [rootComponentId];

    const children = [];
    let gotDraggedComponent = false;

    componentIds.forEach((componentId, idx) => {
      if (draggingComponent) {
        if (componentId === draggedComponentId) {
          gotDraggedComponent = true;
          return;
        }
        
        const afterIdx = gotDraggedComponent ? idx - 2 : idx - 1;
        
        const snapPointOrPlaceholder =
          this._renderSnapBlockOrPlaceholder(parentComponentId, afterIdx);

        if (snapPointOrPlaceholder)
          children.push(snapPointOrPlaceholder);
      }

      children.push(this._renderItem(componentId));
    });

    if (draggingComponent) {
      const afterIdx = gotDraggedComponent
        ? componentIds.size - 2
        : componentIds.size - 1;
      
      const snapPointOrPlaceholder = this._renderSnapBlockOrPlaceholder(
        parentComponentId,
        afterIdx,
      );

      if (snapPointOrPlaceholder)
        children.push(snapPointOrPlaceholder);
    }

    if (!children.length) return null;

    //noinspection JSValidateTypes
    return (
      <ComponentsTreeList>
        {children}
      </ComponentsTreeList>
    );
  }

  render() {
    const { draggingComponent, getLocalizedText } = this.props;

    if (!this._treeIsVisible()) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('tree.noComponents')}
        />
      );
    }
    
    const list = this._renderList(INVALID_ID);

    return (
      <BlockContentBox
        isBordered
        flex
        elementRef={this._saveContentBoxRef}
        autoScrollUpDown={draggingComponent}
      >
        <ComponentsTree>
          {list}
        </ComponentsTree>
      </BlockContentBox>
    );
  }
}

ComponentsTreeViewComponent.propTypes = propTypes;
ComponentsTreeViewComponent.defaultProps = defaultProps;
ComponentsTreeViewComponent.displayName = 'ComponentsTreeView';

const wrap = compose(
  connect(mapStateToProps, mapDispatchToProps),
  connectDropZone,
  dropZone,
);

export const ComponentsTreeView = wrap(ComponentsTreeViewComponent);
