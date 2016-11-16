/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {
    connectDragHandler
} from '../../hocs/connectDragHandler';

import {
    ComponentsTree,
    ComponentsTreeItem,
    ComponentsTreeList,
	ComponentsTreeLine,
} from '../../components/ComponentsTree/ComponentsTree';

import {
    BlockContentBox,
    BlockContentPlaceholder
} from '../../components/BlockContent/BlockContent';

import {
    expandTreeItem,
    collapseTreeItem
} from '../../actions/design';

import {
    selectPreviewComponent,
    deselectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent,
    startDragExistingComponent,
    dragOverComponent,
    dragOverPlaceholder
} from '../../actions/preview';

import {
    currentComponentsSelector,
    currentRootComponentIdSelector,
    currentSelectedComponentIdsSelector,
    currentHighlightedComponentIdsSelector
} from '../../selectors';

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
    isContainerComponent,
	isCompositeComponent,
    canInsertComponent
} from '../../utils/meta';

import {
  selectTool
} from '../../actions/desktop';

import { getLocalizedText } from '../../utils';

import { List } from 'immutable';

const CURSOR_STATES = {
	TOP: 'TOP',
	MIDDLE: 'MIDDLE',
	BOTTOM: 'BOTTOM',
	OUT: 'OUT',
};

class ComponentsTreeViewComponent extends PureComponent {
    constructor(props) {
        super(props);

        this.isMouseOver = false;
		this.closestItemComponentId = -1;
		this.cursorState = CURSOR_STATES.OUT;
		this.expandTimeout = null;

        this._renderItem = this._renderItem.bind(this);
        this._handleExpand = this._handleExpand.bind(this);
        this._handleSelect = this._handleSelect.bind(this);
        this._handleHover = this._handleHover.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._createElementRef = this._createElementRef.bind(this);
		this._createItemRef = this._createItemRef.bind(this);
		this._createLineRef = this._createLineRef.bind(this);
		this._expandAfterTime = this._expandAfterTime.bind(this);
		this._clearExpandTimeout = this._clearExpandTimeout.bind(this);
		this._resetDrag = this._resetDrag.bind(this);
		this._containsPlaceholderContainer
			= this._containsPlaceholderContainer.bind(this);
		this._scrollToLine = this._scrollToLine.bind(this);

		this.itemRefs = new Map();
    }

    componentDidMount() {
        document.addEventListener('mousemove', this._handleMouseMove);
    }

	_scrollToLine() {
		if (!this.lineElement) return;
		!this.isMouseOver
		&& this.lineElement.scrollIntoView(false);
	}

    componentWillReceiveProps(nextProps) {
        !this.isMouseOver
		&& !nextProps.draggingComponent
		&& this.props.draggingComponent
		&& this.props.onToolSelect('componentsLibrary');
    }

	componentDidUpdate() {
		this._scrollToLine();
	}

    componentWillUnmount() {
        document.removeEventListener('mousemove', this._handleMouseMove);
		this.itemRefs.clear();
		this._clearExpandTimeout();
    }

    _createElementRef(ref) {
        this.element = ref;
    }

	_createItemRef(componentId, ref) {
		this.itemRefs.forEach((v, k) => !v && this.itemRefs.delete(k));
		this.itemRefs.set(componentId, ref);
	}

	_createLineRef(ref) {
		this.lineElement = ref;
	}

	_isCursorOnElementTop(element, event) {
		const boundingClientRect = element.getBoundingClientRect();
		const elementY = event.pageY - boundingClientRect.top;
		return elementY < boundingClientRect.height / 2;
	}

	_clearExpandTimeout() {
		clearTimeout(this.expandTimeout);
	}

	_expandAfterTime(componentId, time) {
		const expandComponent = (componentId) =>
			(!time || this.props.highlightedComponentIds.has(componentId))
			&& this.props.draggingComponent
			&& !this.props.expandedItemIds.has(componentId)
			&& this.props.onExpandItem(componentId);

		this.expandTimeout = time
			?	setTimeout(
					expandComponent, time, componentId
				)
			: 	expandComponent(componentId);

	}

	_resetDrag() {
		if (
			this.props.draggingOverComponentId + 1
			|| this.props.placeholderContainerId + 1
		) {
			this.props.onDragOverPlaceholder(-1, -1);
			this.props.onDragOverComponent(-1);
		}
	}

    _handleMouseMove(event) {
		if (this.props.draggingComponent) {
	        this.isMouseOver = this.element && this.element.contains(event.target);

			if (!this.isMouseOver) return;

			const closestItemComponentId =
			 		this._getClosestCursorItemComponentId(event);

			if (closestItemComponentId === -1) return;

			const itemElement = this.itemRefs.get(
				closestItemComponentId
			);

			if (!itemElement) return void this._resetDrag();

			const cursorState
				= this.getCursorState(
					event,
					itemElement,
					this.props.borderPixels
				);

            if (
				cursorState === CURSOR_STATES.OUT
				||	this.cursorState === cursorState
				&&	this.closestItemComponentId === closestItemComponentId
			) return;

            this.cursorState = cursorState;
			this.closestItemComponentId = closestItemComponentId;

			const highlighted =
					this.props.highlightedComponentIds.includes(
						this.closestItemComponentId
					);

			this.cursorState === CURSOR_STATES.MIDDLE
				?	!highlighted &&
					this.props.onHighlightItem(this.closestItemComponentId)
				: 	highlighted &&
					this.props.onUnhighlightItem(this.closestItemComponentId);

			const willDropInCurrentContainer =
				this.cursorState === CURSOR_STATES.MIDDLE
				||	this.cursorState === CURSOR_STATES.BOTTOM
				&&	this.props.expandedItemIds.includes(
					this.closestItemComponentId
				);

			const component =
					this.props.components.get(this.closestItemComponentId);

			const parentComponent =
					this.props.components.get(component.parentId);


            const currentPlaceholderContainer =
				willDropInCurrentContainer
				|| !parentComponent
				?	component
				:	parentComponent;

			if (
				isContainerComponent(component.name, this.props.meta)
				|| isCompositeComponent(component.name, this.props.meta)
			) this._expandAfterTime(
				this.closestItemComponentId,
				this.closestItemComponentId === this.props.rootComponentId
					? 0 : this.props.timeToExpand
			);

			if (
				this.cursorState === CURSOR_STATES.MIDDLE
				&& !isContainerComponent(component.name, this.props.meta)
			) return void this._resetDrag();


            if (
				!currentPlaceholderContainer
				|| currentPlaceholderContainer.id === this.props.rootComponentId
			) return;


			for (
				let parentId = currentPlaceholderContainer.id;
				parentId + 1;
			) {
				if (parentId === this.props.draggedComponentId) return;
				const component = this.props.components.get(parentId);
				if (component)
					parentId = component.parentId;
				else break;
			}

			const indexOfPlaceholder =
				willDropInCurrentContainer
				?	currentPlaceholderContainer.children.size
				:	currentPlaceholderContainer.children.indexOf(
						this.closestItemComponentId
					)
					-
					(
						this.cursorState === CURSOR_STATES.TOP
					);

            const currentPlaceholderContainerChildrenNames =
                currentPlaceholderContainer.children.map(
                    childId => this.props.components.get(childId).name
                );

            const canInsert = canInsertComponent(
                this.props.draggedComponents.get(
					this.props.draggedComponentId + 1
						?	this.props.draggedComponentId
						: 	0
				).name,
                currentPlaceholderContainer.name,
                currentPlaceholderContainerChildrenNames,
                indexOfPlaceholder,
                this.props.meta
            );

            if (canInsert) {
				this.props.draggingOverComponentId
					!== this.closestItemComponentId
				&& this.props.onDragOverComponent(
					this.closestItemComponentId
				);
				(
				this.props.placeholderContainerId
					!== currentPlaceholderContainer.id
				|| this.props.placeholderAfter
					!== indexOfPlaceholder
				) && this.props.onDragOverPlaceholder(
                    currentPlaceholderContainer.id,
                    indexOfPlaceholder
                );
			}
		}
    }

    _handleExpand(componentId, state) {
        if (state) this.props.onExpandItem(componentId);
        else this.props.onCollapseItem(componentId);
    }

    _handleSelect(componentId, state) {
        if (state) this.props.onSelectItem(componentId);
        else this.props.onDeselectItem(componentId);
    }

	_handleHover(componentId, state) {
		if (state && !this.props.draggingComponent)
			this.props.onHighlightItem(componentId);
		else this.props.onUnhighlightItem(componentId);
	}

	getCursorState({ pageX, pageY }, itemRef, additionalPixels) {

		const { top, bottom, left, right } = itemRef.getBoundingClientRect();

		if (pageX < left || pageX > right) return CURSOR_STATES.OUT;

		const positionY = pageY;

		return CURSOR_STATES[
			positionY < bottom
			&& positionY > top
			&& (
				positionY - top <= additionalPixels
				&& 'TOP'
				||
				bottom - positionY <= additionalPixels
				&& 'BOTTOM'
				|| 'MIDDLE'
			)
			|| (
				positionY - top < 0
					? 'TOP'
					: 'BOTTOM'
			)
		];

	}

	_containsPlaceholderContainer(componentId) {
		if (!this.props.draggingComponent) return false;
		if (componentId === this.props.placeholderContainerId) return true;
		else {
			const children = this.props.components.get(componentId).children;
			if (!children) return false;
			else
				return children.map(this._containsPlaceholderContainer).includes(true);

		}

	}

	_getClosestCursorItemComponentId(event) {
		let closestItemComponentId = -1;
		let minHeightDiff = Infinity;
		this.itemRefs.forEach(
			(ref, componentId) => {
				const { top, bottom } = ref.getBoundingClientRect();
				[top, bottom].forEach(val => {
					const diff = Math.abs(event.y - val);
					if (diff < minHeightDiff) {
						minHeightDiff = diff;
						closestItemComponentId = componentId;
					}
				});
			}
		);
		return closestItemComponentId;
	}

    _handleMouseDown(componentId, event) {
        componentId !== this.props.rootComponentId
		&& this._handleStartDragExistingComponent(event, componentId);
    }

    _renderLine() {
        return (
            <ComponentsTreeLine
				createElementRef={this._createLineRef}
				key="divider-line"
			/>
        );
    }

    _renderItem(componentId, idx) {
        const component = this.props.components.get(componentId);

        const indexOfLine =
        	component.children
			? component.children.indexOf(this.props.draggingOverComponentId)
			: -1;

        const isCurrentComponentActiveContainer =
          componentId === this.props.placeholderContainerId
		  &&
            canInsertComponent(
				this.props.draggedComponents.get(
					this.props.draggedComponentId + 1
						?	this.props.draggedComponentId
						: 	0
				).name,
				component.name,
				component.children.map(
					childId => this.props.components.get(childId).name
				),
				indexOfLine,
				this.props.meta
		  );

        const children = component.children.size > 0
            ? this._renderList(
				component.children,
				isCurrentComponentActiveContainer,
				indexOfLine
			)
            : (
				isCurrentComponentActiveContainer
				? <ComponentsTreeList children={this._renderLine()} />
				: null
			);

        let title, subtitle;

        if (component.title) {
            title = component.title;
            subtitle = component.name;
        }
        else {
            title = component.name;
            subtitle = '';
        }

        return (
			<ComponentsTreeItem
				componentId={componentId}
				key={idx}
				title={title}
				subtitle={subtitle}
				expanded={
					this.props.expandedItemIds.has(componentId)
					|| !this.isMouseOver && this.props.draggingComponent
				}
				active={this.props.selectedComponentIds.has(componentId)}
				hovered={
					this.props.highlightedComponentIds.has(componentId)
					|| isCurrentComponentActiveContainer
				}
				onExpand={this._handleExpand}
				onSelect={this._handleSelect}
				onHover={this._handleHover}
				onMouseDown={this._handleMouseDown}
				children={children}
				createItemRef={this._createItemRef}
			/>
		);
    }

    _renderList(componentIds, showLine, indexOfLine) {

        const indexOfLinePlaceholder =
			indexOfLine + 1
				? indexOfLine + (this.props.placeholderAfter >= indexOfLine)
				: (this.props.placeholderAfter + 1 ? this.props.placeholderAfter : 0);

        const children =
			this.props.draggingOverPlaceholder && showLine
				? componentIds.map(this._renderItem).insert(
					indexOfLinePlaceholder,
					this._renderLine()
				)
				: componentIds.map(this._renderItem);

        return (
            <ComponentsTreeList>
                {children}
            </ComponentsTreeList>
        );
    }

    render() {
        const { getLocalizedText } = this.props;

        if (this.props.rootComponentId === -1)
            return (
                <BlockContentPlaceholder
                    text={getLocalizedText('thereAreNoComponentsInThisRoute')}
                />
            );


        return (
            <BlockContentBox
				createElementRef={this._createElementRef}
				autoScrollUpDown={this.props.draggingComponent}
				isBordered
				flex
			>
                <ComponentsTree>
                    {this._renderList(List([this.props.rootComponentId]))}
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
        PropTypes.number
    ),
    rootComponentId: PropTypes.number,
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
   	highlightedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    expandedItemIds: ImmutablePropTypes.setOf(PropTypes.number),
    draggingComponent: PropTypes.bool,
    draggedComponentId: PropTypes.number,
    draggedComponents: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number
    ),
    draggingOverComponentId: PropTypes.number,
    draggingOverPlaceholder: PropTypes.bool,
    placeholderContainerId: PropTypes.number,
    placeholderAfter: PropTypes.number,
    meta: PropTypes.object,
    getLocalizedText: PropTypes.func,

    onExpandItem: PropTypes.func,
    onCollapseItem: PropTypes.func,
    onSelectItem: PropTypes.func,
    onDeselectItem: PropTypes.func,
    onHighlightItem: PropTypes.func,
    onUnhighlightItem: PropTypes.func,
	onToolSelect: PropTypes.func,
	toolsPanelIsExpanded: PropTypes.bool,
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
	toolsPanelIsExpanded: state.desktop.toolsPanelIsExpanded,
    getLocalizedText: (...args) =>
		getLocalizedText(state.app.localization, state.app.language, ...args)
});

const mapDispatchToProps = dispatch => ({
    onExpandItem: id => void dispatch(expandTreeItem(id)),
    onCollapseItem: id => void dispatch(collapseTreeItem(id)),
    onSelectItem: id => void dispatch(selectPreviewComponent(id, true)),
    onDeselectItem: id => void dispatch(deselectPreviewComponent(id)),
    onHighlightItem: id => void dispatch(highlightPreviewComponent(id)),
    onUnhighlightItem: id => void dispatch(unhighlightPreviewComponent(id)),
    onStartDragItem: id => void dispatch(startDragExistingComponent(id)),
    onDragOverComponent: id => void dispatch(dragOverComponent(id)),
    onDragOverPlaceholder: (id, afterIdx) =>
		void dispatch(dragOverPlaceholder(id, afterIdx)),
	onToolSelect: toolName => void dispatch(selectTool(toolName))
});

export const ComponentsTreeView = connectDragHandler(
  mapStateToProps,
  mapDispatchToProps
)(ComponentsTreeViewComponent);
