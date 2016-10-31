/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// TODO: Get strings from i18n

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
    unhighlightPreviewComponent
} from '../../actions/preview';

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
        const { getLocalizedText } = this.props;
        const rootComponent = this.props.isIndexRoute
            ? this.props.route.indexComponent
            : this.props.route.component;

        if (!rootComponent) {
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
        )
    }
}

ComponentsTreeViewComponent.propTypes = {
    route: PropTypes.instanceOf(ProjectRouteRecord).isRequired,
    isIndexRoute: PropTypes.bool.isRequired,

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

ComponentsTreeViewComponent.displayName = 'ComponentsTreeView';

const mapStateToProps = state => ({
    expandedItemIds: state.design.treeExpandedItemIds,
    selectedItemIds: state.project.selectedItems,
    highlightedItemIds: state.project.highlightedItems,
    getLocalizedText(...args) { return getLocalizedText(state.app.localization, state.app.language, ...args) }
});

const mapDispatchToProps = dispatch => ({
    onExpandItem: id => void dispatch(expandTreeItem(id)),
    onCollapseItem: id => void dispatch(collapseTreeItem(id)),
    onSelectItem: id => void dispatch(selectPreviewComponent(id, true)),
    onDeselectItem: id => void dispatch(deselectPreviewComponent(id)),
    onHighlightItem: id => void dispatch(highlightPreviewComponent(id)),
    onUnhighlightItem: id => void dispatch(unhighlightPreviewComponent(id))
});

export const ComponentsTreeView = connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsTreeViewComponent);
