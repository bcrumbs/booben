/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _forOwn from 'lodash.forown';
import { resolveTypedef } from '@jssy/types';

import {
  MenuOverlapping,
  MenuOverlappingGroup,
  MenuOverlappingGroupItem,
  MenuOverlappingDivider,
} from '../../components/MenuOverlapping/MenuOverlapping';

import { getString } from '../../utils/meta';
import { noop, returnTrue } from '../../utils/misc';

const propTypes = {
  componentMeta: PropTypes.object.isRequired,
  language: PropTypes.string,
  isCompatibleStateSlot: PropTypes.func,
  onSelect: PropTypes.func,
};

const defaultProps = {
  targetUserTypedefs: null,
  language: '',
  isCompatibleStateSlot: returnTrue,
  onSelect: noop,
};

export class ComponentStateSlotSelect extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._handleSelect = this._handleSelect.bind(this);
  }

  _handleSelect({ id }) {
    const { onSelect } = this.props;
    onSelect({ stateSlot: id });
  }

  _renderItemsGroup(items) {
    if (!items.length) return null;

    const itemElements = items.map(item => (
      <MenuOverlappingGroupItem
        {...item}
        key={item.id}
        onSelect={this._handleSelect}
      />
    ));

    return (
      <MenuOverlappingGroup>
        {itemElements}
      </MenuOverlappingGroup>
    );
  }

  render() {
    const {
      componentMeta,
      isCompatibleStateSlot,
      language,
    } = this.props;

    const availableItems = [];
    const disabledItems = [];

    _forOwn(componentMeta.state, (stateSlot, name) => {
      const resolvedTypedef = resolveTypedef(stateSlot, componentMeta.types);
      const isCompatible = isCompatibleStateSlot(resolvedTypedef);

      const item = {
        id: name,
        title: getString(componentMeta.strings, stateSlot.textKey, language),
        type: resolvedTypedef.type,
        description: getString(
          componentMeta.strings,
          stateSlot.descriptionTextKey,
          language,
        ),

        disabled: !isCompatible,
      };

      (isCompatible ? availableItems : disabledItems).push(item);
    });

    const availableGroup = this._renderItemsGroup(availableItems);
    const disabledGroup = this._renderItemsGroup(disabledItems);

    let availableHeader = null;
    let disabledHeader = null;

    if (availableGroup) {
      availableHeader = (
        <MenuOverlappingDivider title="What dou you want to use as a source?" />
      );
    }

    if (disabledGroup) {
      disabledHeader = (
        <MenuOverlappingDivider title="Options that don't suit by type" />
      );
    }

    return (
      <MenuOverlapping>
        {availableHeader}
        {availableGroup}
        {disabledHeader}
        {disabledGroup}
      </MenuOverlapping>
    );
  }
}

ComponentStateSlotSelect.propTypes = propTypes;
ComponentStateSlotSelect.defaultProps = defaultProps;
ComponentStateSlotSelect.displayName = 'ComponentStateSlotSelect';
