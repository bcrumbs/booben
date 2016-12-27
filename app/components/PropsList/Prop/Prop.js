/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';

import {
  PropEmpty,
  PropInput,
  PropTextarea,
  PropList,
  PropToggle,
  PropComponent,
  PropExpandable,
} from '../../props';

import { NestedPropsList } from './NestedPropsList/NestedPropsList';
import { NestedProp } from './NestedProp/NestedProp';

import {
  ComplexPropBreadcrumbs,
} from './ComplexPropBreadcrumbs/ComplexPropBreadcrumbs';

import { noop, returnArg } from '../../../utils/misc';

/**
 * @typedef {Object} PropsItemPropTypeOption
 * @property {*} value
 * @property {string} text
 * @property {boolean} disabled
 */

/**
 * @typedef {Object} PropsItemPropType
 * @property {string} label
 * @property {string} type
 * @property {string} view
 * @property {string} image
 * @property {string} tooltip
 * @property {boolean} linkable
 * @property {PropsItemPropTypeOption[]} [options]
 * @property {Object<string, PropsItemPropType>} [fields]
 * @property {PropsItemPropType} [ofType]
 * @property {Function} [transformValue]
 * @property {Function} [formatItemLabel]
 */

/**
 * @typedef {Object} PropsItemValue
 * @property {*} value
 * @property {boolean} linked
 * @property {boolean} checked
 */

export const ValueShape = PropTypes.shape({
  value: PropTypes.any,
  linked: PropTypes.bool,
  linkedWith: PropTypes.string,
  checked: PropTypes.bool,
  message: PropTypes.string,
  requirementFulfilled: PropTypes.bool,
});

const propTypeShapeFields = {
  label: PropTypes.string,
  type: PropTypes.string,
  view: PropTypes.oneOf([
    'input',
    'textarea',
    'toggle',
    'list',
    'constructor',
    'object',
    'shape',
    'array',
    'empty',
  ]),
  image: PropTypes.string,
  tooltip: PropTypes.string,
  linkable: PropTypes.bool,
  checkable: PropTypes.bool,
  required: PropTypes.bool,
  transformValue: PropTypes.func,
  
  // For 'object' and 'array' views
  formatItemLabel: PropTypes.func,
  
  // Options for 'list' view
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any,
    text: PropTypes.string,
    disabled: PropTypes.bool,
  })),
};

// Fields for 'shape' view
propTypeShapeFields.fields =
  PropTypes.objectOf(PropTypes.shape(propTypeShapeFields));

// Type for 'array' and 'object' views
propTypeShapeFields.ofType = PropTypes.shape(propTypeShapeFields);

export const PropTypeShape = PropTypes.shape(propTypeShapeFields);

/**
 *
 * @type {Set}
 */
const complexViews = new Set([
  'shape',
  'object',
  'array',
]);

/**
 *
 * @param {string} view
 * @return {boolean}
 */
export const isComplexView = view => complexViews.has(view);

const propTypes = {
  propType: PropTypeShape.isRequired,
  value: ValueShape.isRequired,
  disabled: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  
  onChange: PropTypes.func,
  onSetComponent: PropTypes.func,
  onAddValue: PropTypes.func,
  onDeleteValue: PropTypes.func,
  onLink: PropTypes.func,
  onUnlink: PropTypes.func,
  onCheck: PropTypes.func,
};

const defaultProps = {
  disabled: false,
  getLocalizedText: returnArg,
  
  onChange: noop,
  onSetComponent: noop,
  onAddValue: noop,
  onDeleteValue: noop,
  onLink: noop,
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
  if (baseType.view === 'shape') return baseType.fields[index];
  if (baseType.view === 'array') return baseType.ofType;
  if (baseType.view === 'object') return baseType.ofType;
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
  constructor(props) {
    super(props);
    
    this.state = {
      isOpen: false,
      currentPath: [],
    };
    
    this._handleOpen = this._handleOpen.bind(this);
    this._handleOpenNested = this._handleOpenNested.bind(this);
    this._handleBreadcrumbsSelect = this._handleBreadcrumbsSelect.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleLinkNested = this._handleLinkNested.bind(this);
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
  }
  
  /**
   *
   * @private
   */
  _handleOpen() {
    this.setState({
      isOpen: !this.state.isOpen,
      currentPath: [],
    });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleOpenNested({ index }) {
    this.setState({
      currentPath: [...this.state.currentPath, index],
    });
  }
  
  /**
   *
   * @param {number} index
   * @private
   */
  _handleBreadcrumbsSelect({ index }) {
    this.setState({
      currentPath: this.state.currentPath.slice(0, index),
    });
  }
  
  /**
   *
   * @param {boolean} checked
   * @private
   */
  _handleCheck({ checked }) {
    this.props.onCheck({ checked, path: [] });
  }
  
  /**
   *
   * @param {boolean} checked
   * @param {number} index
   * @private
   */
  _handleCheckNested({ checked, index }) {
    this.props.onCheck({ checked, path: [...this.state.currentPath, index] });
  }
  
  /**
   *
   * @private
   */
  _handleLink() {
    this.props.onLink({ path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleLinkNested({ index }) {
    this.props.onLink({ path: [...this.state.currentPath, index] });
  }
  
  /**
   *
   * @private
   */
  _handleUnlink() {
    this.props.onUnlink({ path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleUnlinkNested({ index }) {
    this.props.onUnlink({ path: [...this.state.currentPath, index] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleDeleteValue({ index }) {
    this.props.onDeleteValue({ index, where: this.state.currentPath });
  }
  
  /**
   *
   * @param {Object} [name]
   * @private
   */
  _handleAddValue({ name }) {
    const currentType = getTypeByPath(
      this.props.propType,
      this.state.currentPath,
    );
    
    const index = currentType.view === 'array' ? -1 : name;
  
    this.props.onAddValue({ index, where: this.state.currentPath });
  }
  
  /**
   *
   * @param {*} value
   * @private
   */
  _handleChange({ value }) {
    this.props.onChange({ value, path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @param {*} value
   * @private
   */
  _handleChangeNested({ index, value }) {
    this.props.onChange({ value, path: [...this.state.currentPath, index] });
  }
  
  /**
   *
   * @private
   */
  _handleSetComponent() {
    this.props.onSetComponent({ path: [] });
  }
  
  /**
   *
   * @param {string|number} index
   * @private
   */
  _handleSetComponentNested({ index }) {
    this.props.onSetComponent({ path: [...this.state.currentPath, index] });
  }
  
  _renderBreadcrumbs() {
    if (this.state.currentPath.length === 0) return null;
    
    const items = [{
      title: this.props.propType.label,
      subtitle: this.props.propType.type,
    }];
    
    let currentType = this.props.propType;
    
    for (let i = 0, l = this.state.currentPath.length; i < l; i++) {
      const pathElement = this.state.currentPath[i],
        nestedType = getNestedType(currentType, pathElement);
      
      items.push({
        title: currentType.view === 'shape'
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
    if (!this.state.isOpen) return null;
  
    const currentType = getTypeByPath(
      this.props.propType,
      this.state.currentPath,
    );
  
    const currentValue = getValueByPath(
      this.props.value,
      this.state.currentPath,
    );
  
    if (!currentValue || currentValue.value === null) return null;
    
    if (currentType.view === 'shape') {
      return Object.keys(currentType.fields).map(fieldName => (
        <NestedProp
          key={fieldName}
          propType={currentType.fields[fieldName]}
          value={currentValue.value[fieldName]}
          index={fieldName}
          label={fieldName}
          disabled={this.props.disabled}
          onChange={this._handleChangeNested}
          onSetComponent={this._handleSetComponentNested}
          onLink={this._handleLinkNested}
          onUnlink={this._handleUnlinkNested}
          onCheck={this._handleCheckNested}
          onOpen={this._handleOpenNested}
        />
      ));
    } else if (currentType.view === 'array') {
      /* eslint-disable react/no-array-index-key */
      return currentValue.value.map((itemValue, idx) => (
        <NestedProp
          key={String(idx)}
          propType={currentType.ofType}
          value={itemValue}
          index={idx}
          label={currentType.formatItemLabel(idx)}
          disabled={this.props.disabled}
          deletable
          onChange={this._handleChangeNested}
          onSetComponent={this._handleSetComponentNested}
          onLink={this._handleLinkNested}
          onUnlink={this._handleUnlinkNested}
          onCheck={this._handleCheckNested}
          onOpen={this._handleOpenNested}
          onDelete={this._handleDeleteValue}
        />
      ));
      /* eslint-enable react/no-array-index-key */
    } else if (currentType.view === 'object') {
      return Object.keys(currentValue.value).map(key => (
        <NestedProp
          key={key}
          propType={currentType.ofType}
          value={currentValue[key]}
          index={key}
          label={currentType.formatItemLabel(key)}
          disabled={this.props.disabled}
          deletable
          onChange={this._handleChangeNested}
          onSetComponent={this._handleSetComponentNested}
          onLink={this._handleLinkNested}
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
      linked: !!value.linked,
      linkedWith: value.linkedWith || '',
      checkable: !!propType.checkable,
      checked: !!value.checked,
    };
    
    if (propType.view === 'input') {
      return (
        <PropInput
          {...commonProps}
          value={value.value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    } else if (propType.view === 'textarea') {
      return (
        <PropTextarea
          {...commonProps}
          value={value.value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    } else if (propType.view === 'toggle') {
      return (
        <PropToggle
          {...commonProps}
          value={value.value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    } else if (propType.view === 'list') {
      return (
        <PropList
          {...commonProps}
          options={propType.options}
          value={value.value}
          disabled={disabled}
          onChange={this._handleChange}
        />
      );
    } else if (propType.view === 'constructor') {
      return (
        <PropComponent
          {...commonProps}
          haveComponent={value.value}
          disabled={disabled}
          onSetComponent={this._handleSetComponent}
        />
      );
    } else if (propType.view === 'empty') {
      return (
        <PropEmpty {...commonProps} />
      );
    } else if (isComplexView(propType.view)) {
      const currentType = getTypeByPath(
        this.props.propType,
        this.state.currentPath,
      );
      
      const hasDynamicValues =
        currentType.view === 'array' ||
        currentType.view === 'object';
  
      const needNameOnAdd = currentType.view === 'object';
  
      const breadcrumbs = this._renderBreadcrumbs(),
        nestedProps = this._renderNestedProps();
      
      return (
        <PropExpandable
          {...commonProps}
          expanded={isOpen}
          onToggle={this._handleOpen}
        >
          <NestedPropsList
            hasAddButton={hasDynamicValues}
            askNameOnAdd={needNameOnAdd}
            getLocalizedText={getLocalizedText}
          >
            {breadcrumbs}
            {nestedProps}
          </NestedPropsList>
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
