/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
    ComponentsTree,
    ComponentsTreeItem,
    ComponentsTreeList
} from '../../components/ComponentsTree/ComponentsTree';

import {
    expandTreeItem,
    collapseTreeItem
} from '../../actions/design';

import {
    selectPreviewComponent,
    deselectPreviewComponent,
    highlightPreviewComponent,
    unhighlightPreviewComponent
} from '../../actions/preview';

import ProjectComponentRecord from '../../models/ProjectComponent';

import { List } from 'immutable';

class ComponentsTreeViewComponent extends Component {
    constructor(props) {
        super(props);

        this._renderItem = this._renderItem.bind(this);
    }
    
    shouldComponentUpdate(nextProps) {
        return nextProps.rootComponent !== this.props.rootComponent ||
            nextProps.expandedItemIds !== this.props.expandedItemIds ||
            nextProps.selectedItemIds !== this.props.selectedItemIds ||
            nextProps.highlightedItemIds !== this.props.highlightedItemIds;
    }

    _handleExpand(itemId, state) {
        if (state) this.props.onExpandItem(itemId);
        else this.props.onCollapseItem(itemId);
    }

    _handleSelect(itemId, state) {
        if (state) this.props.onSelectItem(itemId);
        else this.props.onDeselectItem(itemId);
    }
    
    _handleHover(itemId, state) {
        if (state) this.props.onHighlightItem(itemId);
        else this.props.onUnhighlightItem(itemId);
    }

    _renderItem(item, idx) {
        const children = item.children.size > 0
            ? this._renderList(item.children)
            : null;

        let title, subtitle;

        if (item.title) {
            title = item.title;
            subtitle = item.name;
        }
        else {
            title = item.name;
            subtitle = '';
        }

        return (
            <ComponentsTreeItem
                key={idx}
                title={title}
                subtitle={subtitle}
                expanded={this.props.expandedItemIds.has(item.id)}
                active={this.props.selectedItemIds.has(item.id)}
                hovered={this.props.highlightedItemIds.has(item.id)}
                children={children}
                onExpand={this._handleExpand.bind(this, item.id)}
                onSelect={this._handleSelect.bind(this, item.id)}
                onHover={this._handleHover.bind(this, item.id)}
            />
        );
    }

    _renderList(items) {
        return (
            <ComponentsTreeList>
                {items.map(this._renderItem)}
            </ComponentsTreeList>
        )
    }

    render() {
        if (!this.props.rootComponent) return null;

        return (
            <ComponentsTree>
                {this._renderList(List([this.props.rootComponent]))}
            </ComponentsTree>
        )
    }
}

ComponentsTreeViewComponent.propTypes = {
    rootComponent: PropTypes.instanceOf(ProjectComponentRecord),

    expandedItemIds: ImmutablePropTypes.setOf(PropTypes.number),
    selectedItemIds: ImmutablePropTypes.setOf(PropTypes.number),
    highlightedItemIds: ImmutablePropTypes.setOf(PropTypes.number),

    onExpandItem: PropTypes.func,
    onCollapseItem: PropTypes.func,
    onSelectItem: PropTypes.func,
    onDeselectItem: PropTypes.func,
    onHighlightItem: PropTypes.func,
    onUnhighlightItem: PropTypes.func
};

ComponentsTreeViewComponent.defaultProps = {
    rootComponent: null
};

ComponentsTreeViewComponent.displayName = 'ComponentsTreeViewComponent';

const mapStateToProps = state => ({
    expandedItemIds: state.design.treeExpandedItemIds,
    selectedItemIds: state.preview.selectedItems,
    highlightedItemIds: state.preview.highlightedItems
});

const mapDispatchToProps = dispatch => ({
    onExpandItem: id => void dispatch(expandTreeItem(id)),
    onCollapseItem: id => void dispatch(collapseTreeItem(id)),
    onSelectItem: id => void dispatch(selectPreviewComponent(id)),
    onDeselectItem: id => void dispatch(deselectPreviewComponent(id)),
    onHighlightItem: id => void dispatch(highlightPreviewComponent(id)),
    onUnhighlightItem: id => void dispatch(unhighlightPreviewComponent(id))
});

export const ComponentsTreeView = connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsTreeViewComponent);
