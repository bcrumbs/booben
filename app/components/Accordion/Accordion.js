'use strict';

import './Accordion.scss';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { AccordionItem } from './AccordionItem/AccordionItem';
import { Set, Record } from 'immutable';
import { noop } from '../../utils/misc';

export class Accordion extends PureComponent {
  componentWillReceiveProps(nextProps) {
    const willUpdateExpandedItems =
            nextProps.items !== this.props.items &&
            nextProps.expandedItemIds === this.props.expandedItemIds;

    if (willUpdateExpandedItems) {
      const newExpandedItemIds = this.props.expandedItemIds.intersect(
                nextProps.items.map(item => item.id),
            );

      if (newExpandedItemIds !== this.props.expandedItemIds)
        this.props.onExpandedItemsChange(newExpandedItemIds);
    }
  }

  _handleToggleExpanded(itemId) {
    let newExpandedIds;

    if (this.props.expandedItemIds && this.props.expandedItemIds.has(itemId)) { newExpandedIds = this.props.expandedItemIds.delete(itemId); } else if (this.props.single) {
      newExpandedIds = Set([itemId]);
    } else {
      newExpandedIds = this.props.expandedItemIds
                ? this.props.expandedItemIds.add(itemId)
                : new Set([itemId]);
    }

    this.props.onExpandedItemsChange(newExpandedIds);
  }

  render() {
    const items = this.props.items.map((item, idx) => {
      const expanded =
                !!this.props.expandedItemIds &&
                this.props.expandedItemIds.has(item.id);

      const onToggleExpanded = this._handleToggleExpanded.bind(this, item.id);

      return (
        <AccordionItem
          key={idx}
          title={item.title}
          expanded={expanded}
          onToggleExpanded={onToggleExpanded}
        >
          {item.content}
        </AccordionItem>
      );
    });

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
  content: null,
});

Accordion.propTypes = {
  items: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(AccordionItemRecord),
    ),

  expandedItemIds: ImmutablePropTypes.setOf(
        PropTypes.string,
    ),

  single: PropTypes.bool,
  onExpandedItemsChange: PropTypes.func,
};

Accordion.defaultProps = {
  items: [],
  expandedItemIds: null,
  single: false,
  onExpandedItemsChange: noop,
};

Accordion.displayName = 'Accordion';
