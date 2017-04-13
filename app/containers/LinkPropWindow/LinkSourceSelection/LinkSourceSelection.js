/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
} from '../../../components/BlockContent/BlockContent';

import { DataList, DataItem } from '../../../components/DataList/DataList';
import { noop } from '../../../utils/misc';

/**
 * @typedef {Object} LinkSourceComponentItem
 * @property {string} id
 * @property {string} title
 * @property {*} [data]
 */

const propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    data: PropTypes.any,
  })),
  onSelect: PropTypes.func,
};

const defaultProps = {
  items: [],
  onSelect: noop,
};

export const LinkSourceSelection = props => {
  const items = props.items.map(item => (
    <DataItem
      key={item.id}
      id={item.id}
      title={item.title}
      data={item.data}
      actionType="jump"
      connection
      onSelect={props.onSelect}
    />
  ));
  
  return (
    <BlockContent>
      <BlockContentBox isBordered flex>
        <BlockContentBoxItem>
          <DataList>
            {items}
          </DataList>
        </BlockContentBoxItem>
      </BlockContentBox>
    </BlockContent>
  );
};

LinkSourceSelection.propTypes = propTypes;
LinkSourceSelection.defaultProps = defaultProps;
LinkSourceSelection.displayName = 'LinkSourceSelection';
