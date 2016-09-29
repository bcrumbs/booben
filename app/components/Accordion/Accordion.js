'use strict';

import './Accordion.scss';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { AccordionItem } from './AccordionItem/AccordionItem';
import { Set, Record } from 'immutable';
import { noop } from '../../utils/misc';

export class Accordion extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.items !== this.props.items ||
            nextProps.expandedItemIds !== this.props.expandedItemIds;
    }

    componentWillReceiveProps(nextProps) {
        const willUpdateExpandedItems =
            nextProps.items !== this.props.items &&
            nextProps.expandedItemIds === this.props.expandedItemIds;

        if (willUpdateExpandedItems) {
            const newExpandedItemIds = this.props.expandedItemIds.intersect(
                nextProps.items.map(item => item.id)
            );

            if (newExpandedItemIds !== this.props.expandedItemIds)
                this.props.onExpandedItemsChange(newExpandedItemIds);
        }
    }

    _replaceExpanded(itemId) {
        this.props.onExpandedItemsChange(Set([itemId]));
    }

    _toggleItem(itemId) {
        const exclude = this.state.expandedItems.has(itemId);

        const newExpandedItems = exclude
            ? this.state.expandedItems.delete(itemId)
            : this.state.expandedItems.add(itemId);

        this.props.onExpandedItemsChange(newExpandedItems);
    }

    render() {
        const onExpandFn = this.props.single
            ? this._replaceExpanded
            : this._toggleItem;

        const items = this.props.items.map((item, idx) => (
            <AccordionItem
                key={idx}
                title={item.title}
                expanded={this.props.expandedItemIds.has(item.id)}
                onExpand={onExpandFn.bind(this, item.id)}
            >
                {item.content}
            </AccordionItem>
        ));

        return (
            <div className="accordion">
                <div className="accordion-list">
                    {items}
                </div>
            </div>
        );
    }
}

export const AccordionItemRecord = Record({
    id: '',
    title: '',
    content: null
});

Accordion.propTypes = {
    items: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(AccordionItemRecord)
    ),

    expandedItemIds: ImmutablePropTypes.setOf(
        PropTypes.string
    ),

    single: PropTypes.bool,
    onExpandedItemsChange: PropTypes.func
};

Accordion.defaultProps = {
    items: [],
    expandedItemIds: null,
    single: false,
    onExpandedItemsChange: noop
};

Accordion.displayName = 'Accordion';
