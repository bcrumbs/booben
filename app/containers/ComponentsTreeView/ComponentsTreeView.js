/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
    connectDragHandler
} from '../../hocs/connectDragHandler';

import {
    ComponentsTree,
    ComponentsTreeItem,
    ComponentsTreeList
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
    dragOverComponent
} from '../../actions/preview';

import {
    isContainerComponent,
    isCompositeComponent,
    canInsertComponent
} from '../../utils/meta';

import ProjectRouteRecord from '../../models/ProjectRoute';

import { getLocalizedText } from '../../utils';

import { List } from 'immutable';

class ComponentsTreeViewComponent extends Component {
    constructor(props) {
        super(props);

        this._renderItem = this._renderItem.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.route !== this.props.route ||
            nextProps.isIndexRoute !== this.props.isIndexRoute ||
            nextProps.expandedItemIds !== this.props.expandedItemIds ||
            nextProps.selectedItemIds !== this.props.selectedItemIds ||
            nextProps.highlightedItemIds !== this.props.highlightedItemIds ||
            nextProps.draggingComponent !== this.props.draggingComponent;
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
        if (this.props.draggingComponent) this.props.onDragOverComponent(componentId);
        if (state) this.props.onHighlightItem(componentId);
        else this.props.onUnhighlightItem(componentId);
    }

    _handleMouseDown(componentId, event) {
        this._handleStartDragExistingComponent(event, componentId);
    }

    _renderLine() {
        return (
          <ComponentsTreeItem key="line-divider" title="---------------" children={null}/>
        );
    }

    _renderItem(componentId, idx) {

        const component = this.props.route.components.get(componentId);

        const isCurrentElementActiveContainer = isContainerComponent(component.name, this.props.meta) && componentId === this.props.placeholderContainerId;

        const children = component.children.size > 0
            ? this._renderList(component.children, isCurrentElementActiveContainer)
            : ( isCurrentElementActiveContainer ? <ComponentsTreeList children={this._renderLine()} /> : null);

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
                expanded={this.props.expandedItemIds.has(componentId) || true}
                active={this.props.selectedItemIds.has(componentId)}
                hovered={this.props.highlightedItemIds.has(componentId)}
                onExpand={this._handleExpand.bind(this, componentId)}
                onSelect={this._handleSelect.bind(this, componentId)}
                onHover={this._handleHover.bind(this, componentId)}
                onMouseDown={this._handleMouseDown.bind(this, componentId)}
                children={children}
            />
        );
    }

    _renderList(componentIds, showLine) {

        const indexOfLine =
          componentIds.findIndex(id => id === this.props.draggingOverComponentId);

        const indexOfLinePlaceholder =
          indexOfLine + (this.props.placeholderAfter >= indexOfLine);

        const modifiedComponentIds =
          indexOfLine + 1 && this.props.draggingOverPlaceholder && showLine
          ?
            componentIds.map(this._renderItem).insert(indexOfLinePlaceholder, this._renderLine())
          :
            componentIds.map(this._renderItem);

        return (
            <ComponentsTreeList>
                {modifiedComponentIds}
            </ComponentsTreeList>
        );
    }

    render() {
        const { getLocalizedText } = this.props;

        const rootComponent = this.props.isIndexRoute
            ? this.props.route.indexComponent
            : this.props.route.component;

        if (rootComponent === -1) {
            return (
                <BlockContentPlaceholder
                    text={getLocalizedText('thereAreNoComponentsInThisRoute')}
                />
            );
        }

        return (
            <BlockContentBox isBordered flex>
                <ComponentsTree>
                    {this._renderList(List([rootComponent]))}
                </ComponentsTree>
            </BlockContentBox>
        );
    }
}

ComponentsTreeViewComponent.propTypes = {
    route: PropTypes.instanceOf(ProjectRouteRecord).isRequired,
    isIndexRoute: PropTypes.bool.isRequired,

    expandedItemIds: ImmutablePropTypes.setOf(PropTypes.number),
    selectedItemIds: ImmutablePropTypes.setOf(PropTypes.number),
    highlightedItemIds: ImmutablePropTypes.setOf(PropTypes.number),
    getLocalizedText: PropTypes.func,

    onExpandItem: PropTypes.func,
    onCollapseItem: PropTypes.func,
    onSelectItem: PropTypes.func,
    onDeselectItem: PropTypes.func,
    onHighlightItem: PropTypes.func,
    onUnhighlightItem: PropTypes.func
};

ComponentsTreeViewComponent.displayName = 'ComponentsTreeView';

const mapStateToProps = ({ design, project, app }) => ({
    expandedItemIds: design.treeExpandedItemIds,
    selectedItemIds: project.selectedItems,
    highlightedItemIds: project.highlightedItems,

    draggingComponent: project.draggingComponent,
    draggedComponentId: project.draggedComponentId,
    draggedComponents: project.draggedComponents,
    draggingOverComponentId: project.draggingOverComponentId,
    draggingOverPlaceholder: project.draggingOverPlaceholder,
    placeholderContainerId: project.placeholderContainerId,
    placeholderAfter: project.placeholderAfter,
    meta: project.meta,

    getLocalizedText: (...args) => getLocalizedText(app.localization, app.language, ...args)
});

const mapDispatchToProps = dispatch => ({
    onExpandItem: id => void dispatch(expandTreeItem(id)),
    onCollapseItem: id => void dispatch(collapseTreeItem(id)),
    onSelectItem: id => void dispatch(selectPreviewComponent(id, true)),
    onDeselectItem: id => void dispatch(deselectPreviewComponent(id)),
    onHighlightItem: id => void dispatch(highlightPreviewComponent(id)),
    onUnhighlightItem: id => void dispatch(unhighlightPreviewComponent(id)),
    onStartDragItem: id => void dispatch(startDragExistingComponent(id)),
    onDragOverComponent: id => void dispatch(dragOverComponent(id))
});

export const ComponentsTreeView = connectDragHandler(
  mapStateToProps,
  mapDispatchToProps
)(ComponentsTreeViewComponent);
