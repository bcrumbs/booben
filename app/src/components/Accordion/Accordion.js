/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set, Record } from 'immutable';

import './Accordion.scss';
import { AccordionItem } from './AccordionItem/AccordionItem';
import { noop } from '../../utils/misc';

export const AccordionItemRecord = Record({
  id: '',
  title: '',
  content: null,
});

const propTypes = {
  items: ImmutablePropTypes.listOf(PropTypes.instanceOf(AccordionItemRecord)),
  expandedItemIds: ImmutablePropTypes.setOf(PropTypes.string),
  single: PropTypes.bool,
  expandAll: PropTypes.bool,
  onExpandedItemsChange: PropTypes.func,
};

const defaultProps = {
  items: [],
  expandedItemIds: null,
  single: false,
  expandAll: false,
  onExpandedItemsChange: noop,
};

export class Accordion extends PureComponent {
  constructor(...args) {
    super(...args);

    this._handleToggleExpanded = this._handleToggleExpanded.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { items, expandedItemIds, onExpandedItemsChange } = this.props;
    
    const willUpdateExpandedItems =
      nextProps.items !== items &&
      nextProps.expandedItemIds === expandedItemIds;

    if (willUpdateExpandedItems) {
      const newExpandedItemIds = expandedItemIds.intersect(
        nextProps.items.map(item => item.id),
      );

      if (newExpandedItemIds !== expandedItemIds) {
        onExpandedItemsChange(newExpandedItemIds);
      }
    }
  }

  _handleToggleExpanded(itemId) {
    const { expandedItemIds, single, onExpandedItemsChange } = this.props;
    
    let newExpandedIds;

    if (expandedItemIds && expandedItemIds.has(itemId)) {
      newExpandedIds = expandedItemIds.delete(itemId);
    } else if (single) {
      newExpandedIds = Set([itemId]);
    } else {
      newExpandedIds = expandedItemIds
        ? expandedItemIds.add(itemId)
        : new Set([itemId]);
    }

    onExpandedItemsChange(newExpandedIds);
  }

  render() {
    const { items, expandedItemIds, expandAll } = this.props;
    
    const itemElements = items.map(item => {
      const expanded =
        expandAll || (!!expandedItemIds && expandedItemIds.has(item.id));

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
          {itemElements}
        </div>
      </div>
    );
  }
}

Accordion.propTypes = propTypes;
Accordion.defaultProps = defaultProps;
Accordion.displayName = 'Accordion';
