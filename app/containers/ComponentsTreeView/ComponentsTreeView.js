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

import { getLocalizedText } from '../../utils';

import { List } from 'immutable';

class ComponentsTreeViewComponent extends PureComponent {
    constructor(props) {
        super(props);

        this.isMouseOver = false;
		this.isCursorOnTop = true;
		this.expandTimeout = null;

        this._renderItem = this._renderItem.bind(this);
        this._handleExpand = this._handleExpand.bind(this);
        this._handleSelect = this._handleSelect.bind(this);
        this._handleHover = this._handleHover.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._createElementRef = this._createElementRef.bind(this);
		this._createItemRef = this._createItemRef.bind(this);
		this._expandAfterTime = this._expandAfterTime.bind(this);
		this._clearExpandTimeout = this._clearExpandTimeout.bind(this);

		this.itemRefs = new Map();
    }

    componentDidMount() {
        document.addEventListener('mousemove', this._handleMouseMove);
    }

    componentWillReceiveProps(nextProps) {
        !this.isMouseOver
		&& !nextProps.draggingComponent
		&& this.props.draggingComponent
		&& this.props.onToolSelect('componentsLibrary');
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

	_isCursorOnElementTop(element, event) {
		const boundingClientRect = element.getBoundingClientRect();
		const elementY = event.pageY - boundingClientRect.top;
		return elementY < boundingClientRect.height / 2;
	}

	_clearExpandTimeout() {
		clearTimeout(this.expandTimeout);
	}

	_expandAfterTime(componentId, time) {
		const component = this.props.components.get(componentId);

		const expandComponentAndTryToInsert = (componentId, component) =>
			(!time || this.props.highlightedComponentIds.has(componentId))
			&& (
				this.props.onExpandItem(componentId),
				this.props.draggingComponent
				&&
				canInsertComponent(
					this.props.components.get(this.props.rootComponentId).name,
					component.name,
					component.children.map(
						childId => this.props.components.get(childId).name
					),
					-1,
					this.props.meta
				) && this.props.onDragOverPlaceholder(componentId, -1)
			);

		this.expandTimeout = time
			?	setTimeout(
					expandComponentAndTryToInsert, time, componentId, component
				)
			: expandComponentAndTryToInsert(componentId, component);

	}

    _handleMouseMove(event) {
		if (this.props.draggingComponent) {
	        this.isMouseOver = this.element && this.element.contains(event.target);
			if (this.isMouseOver && this.props.draggingOverComponentId + 1) {
				const itemElement = this.itemRefs.get(this.props.draggingOverComponentId);

				if (itemElement)
					if (!itemElement.contains(event.target)) {
						const boundingClientRect = itemElement.getBoundingClientRect();

						if (
							event.pageX < boundingClientRect.left
							|| event.pageX > boundingClientRect.right
						) {
							this.props.onDragOverComponent(-1);
							this.props.onDragOverPlaceholder(-1, -1);
						}
					}
					else
						this._isCursorOnElementTop(itemElement, event)
							!== this.isCursorOnTop
						&& this._handleHover(
							this.props.draggingOverComponentId,
							true,
							itemElement,
							event
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

    _handleHover(componentId, state, element, event) {
		this._clearExpandTimeout();
        if (state) {
            const component = this.props.components.get(componentId);

            if (this.props.draggingComponent) {
                const currentPlaceholderContainer =
                	this.props.components.get(component.parentId);

					if (
						isContainerComponent(component.name, this.props.meta)
						|| isCompositeComponent(component.name, this.props.meta)
					) this._expandAfterTime(
						componentId,
						currentPlaceholderContainer
						&& isCompositeComponent(
							currentPlaceholderContainer.name,
							this.props.meta
						)
						|| componentId === this.props.rootComponentId
						 	? 0 : this.props.timeToExpand
					);

                if (currentPlaceholderContainer) {
                    const rootComponent =
                        this.props.components.get(this.props.rootComponentId);



					this.isCursorOnTop = this._isCursorOnElementTop(element, event);

					const indexOfPlaceholder =
						currentPlaceholderContainer.children.indexOf(componentId)
						-
						this.isCursorOnTop;

                    const currentPlaceholderContainerChildrenNames =
                        currentPlaceholderContainer.children.map(
                            childId => this.props.components.get(childId).name
                        );

                    const canInsert = canInsertComponent(
                        rootComponent.name,
                        currentPlaceholderContainer.name,
                        currentPlaceholderContainerChildrenNames,
                        indexOfPlaceholder,
                        this.props.meta
                    );

                    if (canInsert) {
						this.props.onDragOverComponent(
							componentId
						);
						this.props.onDragOverPlaceholder(
                            currentPlaceholderContainer.id,
                            indexOfPlaceholder
                        );

					}

                }
            }

            this.props.onHighlightItem(componentId);
        }
        else
            this.props.onUnhighlightItem(componentId);

    }

    _handleMouseDown(componentId, event) {
        componentId !== this.props.rootComponentId
		&& this._handleStartDragExistingComponent(event, componentId);
    }

    _renderLine() {
        return (
            <ComponentsTreeLine key="divider-line"/>
        );
    }

    _renderItem(componentId, idx) {
        const component = this.props.components.get(componentId),
            rootComponent = this.props.components.get(this.props.rootComponentId);

        const indexOfLine =
        	component.children
			? component.children.indexOf(this.props.draggingOverComponentId)
			: -1;

        const isCurrentComponentActiveContainer =
          componentId === this.props.placeholderContainerId
		  &&
            canInsertComponent(
              rootComponent.name,
              component.name,
              component.children.map(childId => this.props.components.get(childId).name),
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
				expanded={this.props.expandedItemIds.has(componentId)}
				active={this.props.selectedComponentIds.has(componentId)}
				hovered={this.props.highlightedComponentIds.has(componentId)}
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
            <BlockContentBox isBordered flex>
                <ComponentsTree createRef={this._createElementRef}>
                    {this._renderList(List([this.props.rootComponentId]))}
                </ComponentsTree>
            </BlockContentBox>
        );
    }
}

ComponentsTreeViewComponent.propTypes = {
	timeToExpand: PropTypes.number,

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
    onUnhighlightItem: PropTypes.func
};

ComponentsTreeViewComponent.defaultProps = {
	timeToExpand: 1000,
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
		void dispatch(dragOverPlaceholder(id, afterIdx))
});

export const ComponentsTreeView = connectDragHandler(
  mapStateToProps,
  mapDispatchToProps
)(ComponentsTreeViewComponent);
