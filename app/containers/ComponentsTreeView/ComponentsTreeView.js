/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

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
    startDragExistingComponent
} from '../../actions/preview';

import {
    currentComponentsSelector,
    currentRootComponentIdSelector,
    currentSelectedComponentIdsSelector,
    currentHighlightedComponentIdsSelector
} from '../../selectors';

import ProjectComponentRecord from '../../models/ProjectComponent';

import { getLocalizedText } from '../../utils';

import { List } from 'immutable';

class ComponentsTreeViewComponent extends Component {
    constructor(props) {
        super(props);

        this._renderItem = this._renderItem.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.components !== this.props.components ||
            nextProps.rootComponentId !== this.props.rootComponentId ||
            nextProps.expandedItemIds !== this.props.expandedItemIds ||
            nextProps.selectedComponentIds !== this.props.selectedComponentIds ||
            nextProps.highlightedComponentIds !== this.props.highlightedComponentIds;
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
        if (state) this.props.onHighlightItem(componentId);
        else this.props.onUnhighlightItem(componentId);
    }

    _handleMouseDown(componentId, event) {
        this._handleStartDragExistingComponent(event, componentId);
    }

    _renderItem(componentId, idx) {
        const component = this.props.components.get(componentId);

        const children = component.children.size > 0
            ? this._renderList(component.children)
            : null;

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
                key={idx}
                title={title}
                subtitle={subtitle}
                expanded={this.props.expandedItemIds.has(componentId)}
                active={this.props.selectedComponentIds.has(componentId)}
                hovered={this.props.highlightedComponentIds.has(componentId)}
                onExpand={this._handleExpand.bind(this, componentId)}
                onSelect={this._handleSelect.bind(this, componentId)}
                onHover={this._handleHover.bind(this, componentId)}
                onMouseDown={this._handleMouseDown.bind(this, componentId)}
                children={children}
            />
        );
    }

    _renderList(componentIds) {
        return (
            <ComponentsTreeList>
                {componentIds.map(this._renderItem)}
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

        return (
            <BlockContentBox isBordered flex>
                <ComponentsTree>
                    {this._renderList(List([this.props.rootComponentId]))}
                </ComponentsTree>
            </BlockContentBox>
        );
    }
}

ComponentsTreeViewComponent.propTypes = {
    components: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number
    ),
    rootComponentId: PropTypes.number,
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    highlightedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    expandedItemIds: ImmutablePropTypes.setOf(PropTypes.number),
    getLocalizedText: PropTypes.func,

    onExpandItem: PropTypes.func,
    onCollapseItem: PropTypes.func,
    onSelectItem: PropTypes.func,
    onDeselectItem: PropTypes.func,
    onHighlightItem: PropTypes.func,
    onUnhighlightItem: PropTypes.func
};

ComponentsTreeViewComponent.displayName = 'ComponentsTreeView';

const mapStateToProps = state => ({
    components: currentComponentsSelector(state),
    rootComponentId: currentRootComponentIdSelector(state),
    selectedComponentIds: currentSelectedComponentIdsSelector(state),
    highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
    expandedItemIds: state.design.treeExpandedItemIds,
    getLocalizedText: (...args) => getLocalizedText(state.app.localization, state.app.language, ...args)
});

const mapDispatchToProps = dispatch => ({
    onExpandItem: id => void dispatch(expandTreeItem(id)),
    onCollapseItem: id => void dispatch(collapseTreeItem(id)),
    onSelectItem: id => void dispatch(selectPreviewComponent(id, true)),
    onDeselectItem: id => void dispatch(deselectPreviewComponent(id)),
    onHighlightItem: id => void dispatch(highlightPreviewComponent(id)),
    onUnhighlightItem: id => void dispatch(unhighlightPreviewComponent(id)),
    onStartDragItem: id => void dispatch(startDragExistingComponent(id)),
});

export const ComponentsTreeView = connectDragHandler(
  mapStateToProps,
  mapDispatchToProps
)(ComponentsTreeViewComponent);
