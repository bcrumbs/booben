/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent, PropTypes } from 'react';
import { isEqualType, getNestedTypedef, resolveTypedef } from '@jssy/types';
import JssyValue from '../../models/JssyValue';

import {
  Prop,
  jssyValueToPropValue,
  jssyTypedefToPropType,
} from '../../components/PropsList/PropsList';

import {
  isValidSourceForValue,
  getString,
  buildDefaultValue,
} from '../../utils/meta';

import { noop, objectSome } from '../../utils/misc';

const propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.instanceOf(JssyValue).isRequired,
  valueDef: PropTypes.object.isRequired,
  userTypedefs: PropTypes.object,
  strings: PropTypes.object,
  language: PropTypes.string,
  ownerProps: PropTypes.object,
  ownerUserTypedefs: PropTypes.object,
  label: PropTypes.string,
  description: PropTypes.string,
  onChange: PropTypes.func,
  onLink: PropTypes.func,
  onConstructComponent: PropTypes.func,
};

const defaultProps = {
  userTypedefs: null,
  strings: null,
  language: '',
  ownerProps: null,
  ownerUserTypedefs: null,
  label: '',
  description: '',
  onChange: noop,
  onLink: noop,
  onConstructComponent: noop,
};

export class JssyValueEditor extends PureComponent {
  constructor(props) {
    super(props);
    
    this._handleChange = this._handleChange.bind(this);
    this._handleAdd = this._handleAdd.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleUnlink = this._handleUnlink.bind(this);
    this._handleConstructComponent = this._handleConstructComponent.bind(this);
  }
  
  _handleChange({ value, path }) {
    const { value: currentValue, onChange } = this.props;
    
    const newValue = path.length > 0
      ? currentValue.setInStatic(path, JssyValue.staticFromJS(value))
      : JssyValue.staticFromJS(value);
    
    onChange({ value: newValue });
  }
  
  _handleAdd({ where, index }) {
    const {
      value: currentValue,
      valueDef,
      userTypedefs,
      strings,
      language,
      onChange,
    } = this.props;
  
    const nestedPropMeta = getNestedTypedef(valueDef, where, userTypedefs);
    const newValueType = resolveTypedef(nestedPropMeta.ofType, userTypedefs);
    const value = buildDefaultValue(newValueType, strings, language);
  
    const newValue = where.length > 0
      ? currentValue.updateInStatic(
        where,
        nestedValue => nestedValue.addValueInStatic(index, value),
      )
      : currentValue.addValueInStatic(index, value);
  
    onChange({ value: newValue });
  }
  
  _handleDelete({ where, index }) {
    const { value: currentValue, onChange } = this.props;
    
    const newValue = where.length > 0
      ? currentValue.updateInStatic(
        where,
        nestedValue => nestedValue.deleteValueInStatic(index),
      )
      : currentValue.deleteValueInStatic(index);
  
    onChange({ value: newValue });
  }
  
  _handleLink({ path }) {
    const {
      valueDef,
      userTypedefs,
      ownerProps,
      ownerUserTypedefs,
      onLink,
    } = this.props;
    
    onLink({
      path,
      targetValueDef: valueDef,
      targetUserTypedefs: userTypedefs,
      ownerProps,
      ownerUserTypedefs,
    });
  }
  
  _handleUnlink({ path }) {
    const {
      value: currentValue,
      valueDef,
      userTypedefs,
      strings,
      language,
      onChange,
    } = this.props;
  
    const nestedPropMeta = getNestedTypedef(valueDef, path, userTypedefs);
    const newValueType = resolveTypedef(nestedPropMeta.ofType, userTypedefs);
    const value = buildDefaultValue(newValueType, strings, language);
    
    const newValue = path.length > 0
      ? currentValue.setInStatic(path, value)
      : value;
  
    onChange({ value: newValue });
  }
  
  _handleConstructComponent({ path }) {
    const {
      valueDef,
      userTypedefs,
      onConstructComponent,
    } = this.props;
    
    onConstructComponent({
      path,
      targetValueDef: valueDef,
      targetUserTypedefs: userTypedefs,
    });
  }
  
  _isLinkableValue() {
    const {
      valueDef,
      userTypedefs,
      ownerProps,
      ownerUserTypedefs,
    } = this.props;
    
    if (isValidSourceForValue(valueDef, 'data')) return true;
    if (isValidSourceForValue(valueDef, 'state')) return true;
    
    if (!ownerProps || !isValidSourceForValue(valueDef, 'static')) return false;
    
    return objectSome(ownerProps, ownerProp => {
      if (ownerProp.dataContext) return false;
      
      return isEqualType(
        valueDef,
        ownerProp,
        userTypedefs,
        ownerUserTypedefs,
      );
    });
  }
  
  _formatLabel() {
    const { valueDef, strings, language, label } = this.props;
    
    if (valueDef.textKey && strings && language)
      return getString(strings, valueDef.textKey, language);
    else if (valueDef.label)
      return valueDef.label;
    else
      return label;
  }
  
  _formatTooltip() {
    const { valueDef, strings, language, description } = this.props;
  
    if (valueDef.descriptionTextKey && strings && language)
      return getString(strings, valueDef.descriptionTextKey, language);
    else if (valueDef.description)
      return valueDef.description;
    else
      return description;
  }
  
  render() {
    const { name, value: jssyValue, valueDef, userTypedefs } = this.props;
    
    const _ = void 0;
    const propType = {
      ...jssyTypedefToPropType(valueDef, _, _, _, userTypedefs),
      label: this._formatLabel(),
      tooltip: this._formatTooltip(),
      linkable: this._isLinkableValue(),
    };
    
    const value = jssyValue
      ? jssyValueToPropValue(jssyValue, valueDef, userTypedefs)
      : { value: null, linked: false, checked: false };
    
    return (
      <Prop
        propName={name}
        propType={propType}
        value={value}
        onChange={this._handleChange}
        onAddValue={this._handleAdd}
        onDeleteValue={this._handleDelete}
        onLink={this._handleLink}
        onUnlink={this._handleUnlink}
        onSetComponent={this._handleConstructComponent}
      />
    );
  }
}

JssyValueEditor.diplayName = 'JssyValueEditor';
JssyValueEditor.propTypes = propTypes;
JssyValueEditor.defaultProps = defaultProps;
