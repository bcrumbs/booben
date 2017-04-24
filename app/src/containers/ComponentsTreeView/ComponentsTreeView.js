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
  ComponentsTreeList,
} from '../../components/ComponentsTree/ComponentsTree';

import {
  ComponentPlaceholder,
} from '../../components/ComponentPlaceholder/ComponentPlaceholder';

import {
  BlockContentBox,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import dropZone from '../../hocs/dropZone';
import { connectDropZone } from '../ComponentsDragArea/ComponentsDragArea';

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
};

const defaultProps = {
  draggedComponents: null,
};

const DROP_ZONE_ID = 'tree';

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  rootComponentId: currentRootComponentIdSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
  expandedItemIds: state.design.treeExpandedItemIds,
  draggingComponent: state.project.draggingComponent,
  draggedComponentId: state.project.draggedComponentId,
  draggedComponents: state.project.draggedComponents,
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  meta: state.project.meta,
  getLocalizedText: getLocalizedTextFromState(state),
  dropZoneId: DROP_ZONE_ID,
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
  onDragOverPlaceholder: (id, afterIdx) =>
    void dispatch(dragOverPlaceholder(id, afterIdx)),
  onDragOverNothing: () =>
    void dispatch(dragOverNothing()),
});

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

const BORDER_PIXELS = 4;
const EXPAND_ON_DRAG_OVER_DELAY = 500;

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

class ComponentsTreeViewComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._element = null;
    this._dropZoneIsReady = false;
    this._itemRefs = new Map();
    this._expandTimeout = null;
    this._componentIdToExpand = -1;

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
    this._saveElementRef = this._saveElementRef.bind(this);
    this._saveItemRef = this._saveItemRef.bind(this);
    this._expandComponent = this._expandComponent.bind(this);
    this._expandComponentAfterTime = this._expandComponentAfterTime.bind(this);
    this._clearExpandTimeout = this._clearExpandTimeout.bind(this);
  }
  
  componentDidMount() {
    const { dropZoneId, onDropZoneReady } = this.props;

    if (this._element) {
      onDropZoneReady({
        id: dropZoneId,
        element: this._element,
        onEnter: this._handleDragEnter,
        onLeave: this._handleDragLeave,
        onDrag: this._handleDrag,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.draggingComponent) {
      this.setState({
        isDraggingOnTree: false,
      });
    }
  }

  componentWillUpdate() {
    this._element = null;
  }

  componentDidUpdate() {
    const { dropZoneId, onDropZoneReady, onDropZoneRemove } = this.props;

    if (this._element) {
      if (!this._dropZoneIsReady) {
        onDropZoneReady({
          id: dropZoneId,
          element: this._element,
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
  }

  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _saveElementRef(ref) {
    this._element = ref;
  }

  /**
   *
   * @param {number} componentId
   * @param {HTMLElement} ref
   * @private
   */
  _saveItemRef(componentId, ref) {
    this._itemRefs.set(componentId, ref);
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
      onDragOverNothing,
      onDragOverPlaceholder,
    } = this.props;

    const { isDraggingOnTree } = this.state;

    if (!isDraggingOnTree) return;
    
    const draggingOverComponentId = this._getClosestItemComponentId(pageY);

    if (draggingOverComponentId === -1) {
      onDragOverNothing();
      return;
    }

    const component = components.get(draggingOverComponentId);

    const cursorPosition = calcCursorPosition(
      pageX,
      pageY,
      this._itemRefs.get(draggingOverComponentId),
      BORDER_PIXELS,
    );

    const willScheduleExpand =
      cursorPosition === CursorPositions.MIDDLE &&
      isContainerComponent(component.name, meta) && (
        !this._expandTimeout ||
        draggingOverComponentId !== this._componentIdToExpand
      );

    if (willScheduleExpand) {
      if (this._expandTimeout) this._clearExpandTimeout();

      this._expandComponentAfterTime(
        draggingOverComponentId,
        EXPAND_ON_DRAG_OVER_DELAY,
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
    this._expandTimeout = null;
    this._componentIdToExpand = -1;
  }
  
  /**
   *
   * @param {number} componentId
   * @param {number} time
   * @private
   */
  _expandComponentAfterTime(componentId, time) {
    this._componentIdToExpand = componentId;
    this._expandTimeout = setTimeout(this._expandComponent, time, componentId);
  }

  /**
   *
   * @private
   */
  _clearExpandTimeout() {
    clearTimeout(this._expandTimeout);
    this._expandTimeout = null;
    this._componentIdToExpand = -1;
  }
  
  /**
   *
   * @param {number} pageY
   * @return {number}
   * @private
   */
  _getClosestItemComponentId(pageY) {
    let closestItemComponentId = -1;
    let minHeightDiff = Infinity;
    
    this._itemRefs.forEach((ref, componentId) => {
      if (!ref) return;
      
      const { top, bottom } = ref.getBoundingClientRect();
      
      const minDiff = Math.min(
        Math.abs(pageY - top),
        Math.abs(pageY - bottom),
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
   * @return {ReactElement}
   * @private
   */
  _renderLine(title = '') {
    //noinspection JSValidateTypes
    return (
      <ComponentPlaceholder
        key="divider-line"
        isPlaced
        title={title}
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
      while (currentId > -1 && !expanded) {
        if (currentId === componentId) expanded = true;
        currentId = components.get(currentId).parentId;
      }
    }

    const hovered = highlightedComponentIds.has(componentId);
    const active = selectedComponentIds.has(componentId);
    const subLevel = this._renderList(componentId);

    //noinspection JSValidateTypes
    return (
      <ComponentsTreeItem
        key={String(componentId)}
        componentId={componentId}
        title={title}
        subtitle={subtitle}
        expanded={expanded}
        active={active}
        hovered={hovered}
        onExpand={this._handleExpand}
        onSelect={this._handleSelect}
        onHover={this._handleHover}
        titleRef={this._saveItemRef}
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
      if (isDraggingOnTree) {
        return null; // TODO: Render snap block
      } else {
        const rootDraggedComponentId =
          draggedComponentId > -1 ? draggedComponentId : 0;

        const rootDraggedComponent =
          draggedComponents.get(rootDraggedComponentId);

        const title = rootDraggedComponent.title || rootDraggedComponent.name;

        return this._renderLine(title);
      }
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
    const { components, rootComponentId, draggingComponent } = this.props;

    const componentIds = parentComponentId > -1
      ? components.get(parentComponentId).children
      : [rootComponentId];

    const children = [];

    componentIds.forEach((componentId, idx) => {
      const item = this._renderItem(componentId);

      if (draggingComponent) {
        const snapPointOrPlaceholder =
          this._renderSnapBlockOrPlaceholder(parentComponentId, idx - 1);

        if (snapPointOrPlaceholder)
          children.push(snapPointOrPlaceholder);
      }

      children.push(item);
    });

    if (draggingComponent) {
      const snapPointOrPlaceholder = this._renderSnapBlockOrPlaceholder(
        parentComponentId,
        componentIds.size - 1,
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
    const { rootComponentId, draggingComponent, getLocalizedText } = this.props;

    if (rootComponentId === -1) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('thereAreNoComponentsInThisRoute')}
        />
      );
    }
    
    const list = this._renderList(-1);

    return (
      <BlockContentBox
        isBordered
        flex
        elementRef={this._saveElementRef}
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
