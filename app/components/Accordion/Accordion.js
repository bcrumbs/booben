/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set, Record } from 'immutable';

import './Accordion.scss';
import { AccordionItem } from './AccordionItem/AccordionItem';
import { noop } from '../../utils/misc';

export class Accordion extends PureComponent {
  constructor(...args) {
    super(...args);

    this._handleToggleExpanded = this._handleToggleExpanded.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const willUpdateExpandedItems =
      nextProps.items !== this.props.items &&
      nextProps.expandedItemIds === this.props.expandedItemIds;

    if (willUpdateExpandedItems) {
      const newExpandedItemIds = this.props.expandedItemIds.intersect(
        nextProps.items.map(item => item.id),
      );

      if (newExpandedItemIds !== this.props.expandedItemIds) {
        this.props.onExpandedItemsChange(newExpandedItemIds);
      }
    }
  }

  _handleToggleExpanded(itemId) {
    let newExpandedIds;

    if (this.props.expandedItemIds && this.props.expandedItemIds.has(itemId)) {
      newExpandedIds = this.props.expandedItemIds.delete(itemId);
    } else if (this.props.single) {
      newExpandedIds = Set([itemId]);
    } else {
      newExpandedIds = this.props.expandedItemIds
        ? this.props.expandedItemIds.add(itemId)
        : new Set([itemId]);
    }

    this.props.onExpandedItemsChange(newExpandedIds);
  }

  render() {
    const items = this.props.items.map(item => {
      const expanded =
        !!this.props.expandedItemIds &&
        this.props.expandedItemIds.has(item.id);

      return (
        <AccordionItem
          key={item.id}
          itemId={item.id}
          title={item.title}
          expanded={expanded}
          onToggleExpanded={this._handleToggleExpanded}
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
