import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  MenuOverlapping,
  MenuOverlappingGroup,
  MenuOverlappingGroupItem,
  MenuOverlappingDivider,
} from '../../components/MenuOverlapping/MenuOverlapping';

import { getLocalizedTextFromState } from '../../selectors';
import { noop } from '../../utils/misc';
import * as BoobenPropTypes from '../../constants/common-prop-types';

const propTypes = {
  componentDataItems: PropTypes.arrayOf(
    BoobenPropTypes.componentDataItem,
  ).isRequired,
  getLocalizedText: PropTypes.func.isRequired, // state
  onSelect: PropTypes.func,
};

const defaultProps = {
  onSelect: noop,
};

const mapStateToProps = state => ({
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

class _ComponentDataSelect extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._handleSelect = this._handleSelect.bind(this);
  }

  _handleSelect({ id: data }) {
    const { onSelect } = this.props;
    onSelect({ data });
  }

  _renderItemsGroup(items) {
    if (!items.length) return null;

    const itemElements = items.map((item, idx) => (
      <MenuOverlappingGroupItem
        key={String(idx)}
        id={item.data}
        title={item.name}
        description={item.description}
        disabled={item.unavailable}
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
    const { componentDataItems, getLocalizedText } = this.props;

    const availableItems = [];
    const disabledItems = [];

    componentDataItems.forEach(item => {
      if (item.unavailable) {
        disabledItems.push(item);
      } else {
        availableItems.push(item);
      }
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

_ComponentDataSelect.propTypes = propTypes;
_ComponentDataSelect.defaultProps = defaultProps;
_ComponentDataSelect.displayName = 'ComponentDataSelect';

export const ComponentDataSelect = wrap(_ComponentDataSelect);
