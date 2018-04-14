import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  PropEmpty,
  PropInput,
  PropTextarea,
  PropList,
  PropToggle,
  PropComponent,
  PropExpandable,
  PropAction,
} from '../../../props';

import {
  PropViews,
  ValueShape,
  PropTypeShape,
  isComplexView,
} from '../common';

import { noop, returnArg } from '../../../../utils/misc';

const propTypes = {
  propType: PropTypeShape.isRequired,
  value: ValueShape.isRequired,
  index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  deletable: PropTypes.bool,
  disabled: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onChange: PropTypes.func,
  onSetComponent: PropTypes.func,
  onEditActions: PropTypes.func,
  onLink: PropTypes.func,
  onUnlink: PropTypes.func,
  onCheck: PropTypes.func,
  onOpen: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  deletable: false,
  disabled: false,
  getLocalizedText: returnArg,
  onChange: noop,
  onSetComponent: noop,
  onEditActions: noop,
  onLink: noop,
  onUnlink: noop,
  onCheck: noop,
  onOpen: noop,
  onDelete: noop,
};

export class NestedProp extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._handleOpen = this._handleOpen.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
    this._handleCheck = this._handleCheck.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleSetComponent = this._handleSetComponent.bind(this);
    this._handleEditActions = this._handleEditActions.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleUnlink = this._handleUnlink.bind(this);
  }

  /**
   *
   * @private
   */
  _handleOpen() {
    const { index, onOpen } = this.props;
    onOpen({ index });
  }

  /**
   *
   * @private
   */
  _handleDelete() {
    const { index, onDelete } = this.props;
    onDelete({ index });
  }

  /**
   *
   * @param {boolean} checked
   * @private
   */
  _handleCheck({ checked }) {
    const { index, onCheck } = this.props;
    onCheck({ index, checked });
  }

  /**
   *
   * @param {*} value
   * @private
   */
  _handleChange({ value }) {
    const { index, onChange } = this.props;
    onChange({ index, value });
  }

  /**
   *
   * @private
   */
  _handleSetComponent() {
    const { index, onSetComponent } = this.props;
    onSetComponent({ index });
  }

  /**
   *
   * @private
   */
  _handleEditActions() {
    const { index, onEditActions } = this.props;
    onEditActions({ index });
  }

  /**
   *
   * @private
   */
  _handleLink() {
    const { index, onLink } = this.props;
    onLink({ index });
  }

  /**
   *
   * @private
   */
  _handleUnlink() {
    const { index, onUnlink } = this.props;
    onUnlink({ index });
  }

  render() {
    const {
      propType,
      value,
      disabled,
      deletable,
      label,
      getLocalizedText,
    } = this.props;

    const commonProps = {
      deletable,
      label,
      secondaryLabel: propType.secondaryLabel,
      image: propType.image,
      tooltip: propType.tooltip,
      message: value.message,
      linkable: !!propType.linkable,
      pickable: !!propType.pickable,
      linked: !!value.linked,
      linkedWith: value.linkedWith || '',
      checkable: !!propType.checkable,
      checked: !!value.checked,
      onDelete: this._handleDelete,
      onCheck: this._handleCheck,
      onLink: this._handleLink,
      onUnlink: this._handleUnlink,
    };

    if (propType.view === PropViews.INPUT) {
      const optionalProps = {};

      if (propType.transformValue) {
        optionalProps.transformValue = propType.transformValue;
      }

      return (
        <PropInput
          {...commonProps}
          {...optionalProps}
          value={value.value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    } else if (propType.view === PropViews.TEXTAREA) {
      const optionalProps = {};

      if (propType.transformValue) {
        optionalProps.transformValue = propType.transformValue;
      }

      return (
        <PropTextarea
          {...commonProps}
          {...optionalProps}
          value={value.value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    } else if (propType.view === PropViews.TOGGLE) {
      return (
        <PropToggle
          {...commonProps}
          value={value.value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    } else if (propType.view === PropViews.LIST) {
      return (
        <PropList
          {...commonProps}
          options={propType.options}
          value={value.value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    } else if (propType.view === PropViews.COMPONENT) {
      return (
        <PropComponent
          {...commonProps}
          haveComponent={value.value}
          disabled={disabled}
          getLocalizedText={getLocalizedText}
          onSetComponent={this._handleSetComponent}
        />
      );
    } else if (propType.view === PropViews.ACTION) {
      return (
        <PropAction
          {...commonProps}
          disabled={disabled}
          getLocalizedText={getLocalizedText}
          onEditActions={this._handleEditActions}
        />
      );
    } else if (propType.view === PropViews.EMPTY) {
      return (
        <PropEmpty {...commonProps} />
      );
    } else if (isComplexView(propType.view)) {
      return (
        <PropExpandable
          {...commonProps}
          onToggle={this._handleOpen}
        />
      );
    } else {
      return null;
    }
  }
}

NestedProp.propTypes = propTypes;
NestedProp.defaultProps = defaultProps;
NestedProp.displayName = 'NestedProp';
