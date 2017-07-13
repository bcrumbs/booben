/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _forOwn from 'lodash.forown';
import { resolveTypedef } from '@jssy/types';

import {
  MenuOverlapping,
  MenuOverlappingGroup,
  MenuOverlappingGroupItem,
  MenuOverlappingDivider,
} from '../../components/MenuOverlapping/MenuOverlapping';

import { getLocalizedTextFromState } from '../../selectors';
import { getString } from '../../lib/meta';
import { noop, returnTrue } from '../../utils/misc';

const propTypes = {
  componentMeta: PropTypes.object.isRequired,
  language: PropTypes.string,
  isCompatibleStateSlot: PropTypes.func,
  getLocalizedText: PropTypes.func.isRequired, // state
  onSelect: PropTypes.func,
};

const defaultProps = {
  targetUserTypedefs: null,
  language: '',
  isCompatibleStateSlot: returnTrue,
  onSelect: noop,
};

const mapStateToProps = state => ({
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

class ComponentStateSlotSelectComponent extends PureComponent {
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
      getLocalizedText,
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
      const textKey = 'design.stateSlotSelection.availableOptionsHeading';
      
      availableHeader = (
        <MenuOverlappingDivider title={getLocalizedText(textKey)} />
      );
    }

    if (disabledGroup) {
      const textKey = 'design.stateSlotSelection.unavailableOptionsHeading';
      
      disabledHeader = (
        <MenuOverlappingDivider title={getLocalizedText(textKey)} />
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

ComponentStateSlotSelectComponent.propTypes = propTypes;
ComponentStateSlotSelectComponent.defaultProps = defaultProps;
ComponentStateSlotSelectComponent.displayName = 'ComponentStateSlotSelect';

export const ComponentStateSlotSelect = wrap(ComponentStateSlotSelectComponent);
