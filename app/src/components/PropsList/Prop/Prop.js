/**
 * @author Dmitriy Bizyaev
 */

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
} from '../../props';

import { NestedPropsList } from './NestedPropsList/NestedPropsList';
import { NestedProp } from './NestedProp/NestedProp';

import {
  ComplexPropBreadcrumbs,
} from './ComplexPropBreadcrumbs/ComplexPropBreadcrumbs';

import {
  PropViews,
  ValueShape,
  PropTypeShape,
  isComplexView,
  jssyTypeToView,
} from './common';

import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  propName: PropTypes.string.isRequired,
  propType: PropTypeShape.isRequired,
  value: ValueShape.isRequired,
  disabled: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onChange: PropTypes.func,
  onSetComponent: PropTypes.func,
  onEditActions: PropTypes.func,
  onAddValue: PropTypes.func,
  onDeleteValue: PropTypes.func,
  onLink: PropTypes.func,
  onPick: PropTypes.func,
  onUnlink: PropTypes.func,
  onCheck: PropTypes.func,
};

const defaultProps = {
  disabled: false,
  getLocalizedText: returnArg,
  onChange: noop,
  onSetComponent: noop,
  onEditActions: noop,
  onAddValue: noop,
  onDeleteValue: noop,
  onLink: noop,
  onPick: noop,
  onUnlink: noop,
  onCheck: noop,
};

/**
 *
 * @param {PropsItemPropType} baseType
 * @param {string|number} index
 * @returns {?PropsItemPropType}
 */
const getNestedType = (baseType, index) => {
  if (baseType.view === PropViews.SHAPE) {
    return baseType.fields[index];
  }

  if (baseType.view === PropViews.ARRAY || baseType.view === PropViews.OBJECT) {
    return baseType.ofType;
  }

  return null;
};

/**
 *
 * @param {PropsItemPropType} propType
 * @param {(string|number)[]} path
 * @return {PropsItemPropType}
 */
const getTypeByPath = (propType, path) => path.reduce(getNestedType, propType);

/**
 *
 * @param {PropsItemValue} value
 * @param {string|number} index
 * @return {*}
 */
const getNestedValue = (value, index) => value.value[index];

/**
 *
 * @param {PropsItemValue} value
 * @param {(string|number)[]} path
 * @return {*}
 */
const getValueByPath = (value, path) => path.reduce(getNestedValue, value);

export class Prop extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      isOpen: false,
      currentPath: [],
    };
    
    this._handleOpen = this._handleOpen.bind(this);
    this._handleOpenNested = this._handleOpenNested.bind(this);
    this._handleBreadcrumbsSelect = this._handleBreadcrumbsSelect.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleLinkNested = this._handleLinkNested.bind(this);
    this._handlePick = this._handlePick.bind(this);
    this._handlePickNested = this._handlePickNested.bind(this);
    this._handleUnlink = this._handleUnlink.bind(this);
    this._handleUnlinkNested = this._handleUnlinkNested.bind(this);
    this._handleCheck = this._handleCheck.bind(this);
    this._handleCheckNested = this._handleCheckNested.bind(this);
    this._handleDeleteValue = this._handleDeleteValue.bind(this);
    this._handleAddValue = this._handleAddValue.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleChangeNested = this._handleChangeNested.bind(this);
    this._handleSetComponent = this._handleSetComponent.bind(this);
    this._handleSetComponentNested = this._handleSetComponentNested.bind(this);
    this._handleEditActions = this._handleEditActions.bind(this);
    this._handleEditActionsNested = this._handleEditActionsNested.bind(this);
  }
  
  /**
   *
   * @private
   */
  _handleOpen() {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen, currentPath: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleOpenNested({ index }) {
    const { currentPath } = this.state;
    this.setState({ currentPath: [...currentPath, index] });
  }
  
  /**
   *
   * @param {number} index
   * @private
   */
  _handleBreadcrumbsSelect({ index }) {
    const { currentPath } = this.state;
    this.setState({ currentPath: currentPath.slice(0, index) });
  }
  
  /**
   *
   * @param {boolean} checked
   * @private
   */
  _handleCheck({ checked }) {
    const { propName, onCheck } = this.props;
    onCheck({ propName, checked, path: [] });
  }
  
  /**
   *
   * @param {boolean} checked
   * @param {number} index
   * @private
   */
  _handleCheckNested({ checked, index }) {
    const { propName, onCheck } = this.props;
    const { currentPath } = this.state;
    onCheck({ propName, checked, path: [...currentPath, index] });
  }
  
  /**
   *
   * @private
   */
  _handleLink() {
    const { propName, onLink } = this.props;
    onLink({ propName, path: [] });
  }

  /**
   *
   * @private
   */
  _handlePick() {
    const { propName, onPick } = this.props;
    onPick({ propName, path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleLinkNested({ index }) {
    const { propName, onLink } = this.props;
    const { currentPath } = this.state;
    onLink({ propName, path: [...currentPath, index] });
  }

  /**
   *
   * @param {string|number} index
   * @private
   */
  _handlePickNested({ index }) {
    const { propName, onPick } = this.props;
    const { currentPath } = this.state;
    onPick({ propName, path: [...currentPath, index] });
  }
  
  /**
   *
   * @private
   */
  _handleUnlink() {
    const { propName, onUnlink } = this.props;
    onUnlink({ propName, path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleUnlinkNested({ index }) {
    const { propName, onUnlink } = this.props;
    const { currentPath } = this.state;
    onUnlink({ propName, path: [...currentPath, index] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleDeleteValue({ index }) {
    const { propName, onDeleteValue } = this.props;
    const { currentPath } = this.state;
    onDeleteValue({ propName, index, where: currentPath });
  }
  
  /**
   *
   * @param {Object} [name]
   * @private
   */
  _handleAddValue({ name }) {
    const { propName, propType, onAddValue } = this.props;
    const { currentPath } = this.state;

    const currentType = getTypeByPath(propType, currentPath);
    const index = currentType.view === PropViews.ARRAY ? -1 : name;
    onAddValue({ propName, index, where: currentPath });
  }
  
  /**
   *
   * @param {*} value
   * @private
   */
  _handleChange({ value }) {
    const { propName, onChange } = this.props;
    onChange({ propName, value, path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @param {*} value
   * @private
   */
  _handleChangeNested({ index, value }) {
    const { propName, onChange } = this.props;
    const { currentPath } = this.state;
    
    onChange({ propName, value, path: [...currentPath, index] });
  }
  
  /**
   *
   * @private
   */
  _handleSetComponent() {
    const { propName, onSetComponent } = this.props;
    onSetComponent({ propName, path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleSetComponentNested({ index }) {
    const { propName, onSetComponent } = this.props;
    const { currentPath } = this.state;
    
    onSetComponent({ propName, path: [...currentPath, index] });
  }
  
  /**
   *
   * @private
   */
  _handleEditActions() {
    const { propName, onEditActions } = this.props;
    onEditActions({ propName, path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleEditActionsNested({ index }) {
    const { propName, onEditActions } = this.props;
    const { currentPath } = this.state;
    
    onEditActions({ propName, path: [...currentPath, index] });
  }
  
  _renderBreadcrumbs() {
    const { propType } = this.props;
    const { currentPath } = this.state;
    
    if (currentPath.length === 0) return null;
    
    const items = [{
      title: propType.label,
      subtitle: propType.type,
    }];
    
    let currentType = propType;
    
    for (let i = 0, l = currentPath.length; i < l; i++) {
      const pathElement = currentPath[i];
      const nestedType = getNestedType(currentType, pathElement);
      
      items.push({
        title: currentType.view === PropViews.SHAPE
          ? nestedType.label
          : currentType.formatItemLabel(pathElement),
        
        subtitle: nestedType.type,
      });
      
      currentType = nestedType;
    }
    
    return (
      <ComplexPropBreadcrumbs
        items={items}
        onItemSelect={this._handleBreadcrumbsSelect}
      />
    );
  }
  
  _renderNestedProps() {
    const { propType, value, disabled, getLocalizedText } = this.props;
    const { isOpen, currentPath } = this.state;

    if (!isOpen) return null;
  
    const currentType = getTypeByPath(propType, currentPath);
    const currentValue = getValueByPath(value, currentPath);
  
    if (!currentValue || currentValue.value === null) return null;
    
    if (currentType.view === PropViews.SHAPE) {
      return Object.keys(currentType.fields).map(fieldName => (
        <NestedProp
          key={fieldName}
          propType={currentType.fields[fieldName]}
          value={currentValue.value[fieldName]}
          index={fieldName}
          label={fieldName}
          disabled={disabled}
          getLocalizedText={getLocalizedText}
          onChange={this._handleChangeNested}
          onSetComponent={this._handleSetComponentNested}
          onEditActions={this._handleEditActionsNested}
          onLink={this._handleLinkNested}
          onPick={this._handlePickNested}
          onUnlink={this._handleUnlinkNested}
          onCheck={this._handleCheckNested}
          onOpen={this._handleOpenNested}
        />
      ));
    } else if (currentType.view === PropViews.ARRAY) {
      /* eslint-disable react/no-array-index-key */
      return currentValue.value.map((itemValue, idx) => (
        <NestedProp
          key={String(idx)}
          propType={currentType.ofType}
          value={itemValue}
          index={idx}
          label={currentType.formatItemLabel(idx)}
          disabled={disabled}
          deletable
          getLocalizedText={getLocalizedText}
          onChange={this._handleChangeNested}
          onSetComponent={this._handleSetComponentNested}
          onEditActions={this._handleEditActionsNested}
          onLink={this._handleLinkNested}
          onPick={this._handlePickNested}
          onUnlink={this._handleUnlinkNested}
          onCheck={this._handleCheckNested}
          onOpen={this._handleOpenNested}
          onDelete={this._handleDeleteValue}
        />
      ));
      /* eslint-enable react/no-array-index-key */
    } else if (currentType.view === PropViews.OBJECT) {
      return Object.keys(currentValue.value).map(key => (
        <NestedProp
          key={key}
          propType={currentType.ofType}
          value={currentValue[key]}
          index={key}
          label={currentType.formatItemLabel(key)}
          disabled={disabled}
          deletable
          getLocalizedText={getLocalizedText}
          onChange={this._handleChangeNested}
          onSetComponent={this._handleSetComponentNested}
          onEditActions={this._handleEditActionsNested}
          onLink={this._handleLinkNested}
          onPick={this._handlePickNested}
          onUnlink={this._handleUnlinkNested}
          onCheck={this._handleCheckNested}
          onOpen={this._handleOpenNested}
          onDelete={this._handleDeleteValue}
        />
      ));
    } else {
      return null;
    }
  }

  _renderNestedPropsList() {
    const { value, propType, getLocalizedText } = this.props;
    const { currentPath } = this.state;

    if (propType.checkable && !value.checked) return null;

    const currentType = getTypeByPath(propType, currentPath);
    const hasDynamicValues =
      currentType.view === PropViews.ARRAY ||
      currentType.view === PropViews.OBJECT;

    const needNameOnAdd = currentType.view === PropViews.OBJECT;
    const breadcrumbs = this._renderBreadcrumbs();
    const nestedProps = this._renderNestedProps();

    return (
      <NestedPropsList
        hasAddButton={hasDynamicValues}
        askNameOnAdd={needNameOnAdd}
        getLocalizedText={getLocalizedText}
        onAdd={this._handleAddValue}
      >
        {breadcrumbs}
        {nestedProps}
      </NestedPropsList>
    );
  }
  
  render() {
    const { propType, value, disabled, getLocalizedText } = this.props;
    const { isOpen } = this.state;
    
    const commonProps = {
      label: propType.label || '',
      secondaryLabel: propType.secondaryLabel || '',
      image: propType.image || '',
      tooltip: propType.tooltip || '',
      message: value.message || '',
      linkable: !!propType.linkable,
      pickable: !!propType.pickable,
      linked: !!value.linked,
      linkedWith: value.linkedWith || '',
      checkable: !!propType.checkable,
      deletable: !!propType.deletable,
      onDelete: propType.onDelete,
      id: propType.id,
      checked: !!value.checked,
      onLink: this._handleLink,
      onPick: this._handlePick,
      onUnlink: this._handleUnlink,
      onCheck: this._handleCheck,
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
          transformValue={propType.transformValue}
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
      const nestedList = this._renderNestedPropsList();
      
      return (
        <PropExpandable
          {...commonProps}
          expanded={isOpen}
          onToggle={this._handleOpen}
        >
          {nestedList}
        </PropExpandable>
      );
    } else {
      return null;
    }
  }
}

Prop.propTypes = propTypes;
Prop.defaultProps = defaultProps;
Prop.displayName = 'Prop';

// Export utils
export {
  PropViews,
  jssyTypeToView,
};
