/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent, PropTypes } from 'react';
import _mapValues from 'lodash.mapvalues';

import {
  TypeNames,
  isEqualType,
  getNestedTypedef,
  resolveTypedef,
  makeDefaultNonNullValue,
} from '@jssy/types';

import JssyValue from '../../models/JssyValue';
import { jssyValueToImmutable } from '../../models/ProjectComponent';

import {
  Prop,
  jssyTypeToView,
  PropViews,
} from '../../components/PropsList/PropsList';

import {
  isValidSourceForValue,
  getString,
  buildDefaultValue,
} from '../../utils/meta';

import { noop, returnArg, objectSome } from '../../utils/misc';

const propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.instanceOf(JssyValue).isRequired,
  valueDef: PropTypes.object.isRequired,
  optional: PropTypes.bool,
  userTypedefs: PropTypes.object,
  strings: PropTypes.object,
  language: PropTypes.string,
  ownerProps: PropTypes.object,
  ownerUserTypedefs: PropTypes.object,
  label: PropTypes.string,
  description: PropTypes.string,
  getLocalizedText: PropTypes.func,
  onChange: PropTypes.func,
  onLink: PropTypes.func,
  onConstructComponent: PropTypes.func,
};

const defaultProps = {
  optional: false,
  userTypedefs: null,
  strings: null,
  language: '',
  ownerProps: null,
  ownerUserTypedefs: null,
  label: '',
  description: '',
  getLocalizedText: returnArg,
  onChange: noop,
  onLink: noop,
  onConstructComponent: noop,
};

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceIntValue = value => {
  const maybeRet = parseInt(value, 10);
  if (!isFinite(maybeRet)) return 0;
  return maybeRet;
};

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceFloatValue = value => {
  const maybeRet = parseFloat(value);
  if (!isFinite(maybeRet)) return 0.0;
  return maybeRet;
};

/**
 *
 * @param {JssyValueDefinition} valueDef
 * @return {boolean}
 */
const isEditableValue = valueDef =>
  isValidSourceForValue(valueDef, 'static') ||
  isValidSourceForValue(valueDef, 'designer');

/**
 *
 * @type {string}
 */
const LINK_TEXT_ITEMS_SEPARATOR = ' -> ';

export class JssyValueEditor extends PureComponent {
  constructor(props) {
    super(props);
    
    this._handleChange = this._handleChange.bind(this);
    this._handleAdd = this._handleAdd.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleUnlink = this._handleUnlink.bind(this);
    this._handleCheck = this._handleCheck.bind(this);
    this._handleConstructComponent = this._handleConstructComponent.bind(this);
    
    this._formatArrayItemLabel = this._formatArrayItemLabel.bind(this);
    this._formatObjectItemLabel = this._formatObjectItemLabel.bind(this);
  }
  
  _handleChange({ value, path }) {
    const { name, value: currentValue, onChange } = this.props;
    
    const newValue = path.length > 0
      ? currentValue.setInStatic(path, JssyValue.staticFromJS(value))
      : JssyValue.staticFromJS(value);
    
    onChange({ name, value: newValue });
  }
  
  _handleAdd({ where, index }) {
    const {
      name,
      value: currentValue,
      valueDef,
      userTypedefs,
      strings,
      language,
      onChange,
    } = this.props;
  
    const nestedPropMeta = getNestedTypedef(valueDef, where, userTypedefs);
    const newValueType = resolveTypedef(nestedPropMeta.ofType, userTypedefs);
    const value = jssyValueToImmutable(buildDefaultValue(
      newValueType,
      strings,
      language,
    ));
  
    const newValue = where.length > 0
      ? currentValue.updateInStatic(
        where,
        nestedValue => nestedValue.addValueInStatic(index, value),
      )
      : currentValue.addValueInStatic(index, value);
  
    onChange({ name, value: newValue });
  }
  
  _handleDelete({ where, index }) {
    const { name, value: currentValue, onChange } = this.props;
    
    const newValue = where.length > 0
      ? currentValue.updateInStatic(
        where,
        nestedValue => nestedValue.deleteValueInStatic(index),
      )
      : currentValue.deleteValueInStatic(index);
  
    onChange({ name, value: newValue });
  }
  
  _handleLink({ path }) {
    const {
      name,
      valueDef,
      userTypedefs,
      ownerProps,
      ownerUserTypedefs,
      onLink,
    } = this.props;
    
    onLink({
      name,
      path,
      targetValueDef: valueDef,
      targetUserTypedefs: userTypedefs,
      ownerProps,
      ownerUserTypedefs,
    });
  }
  
  _handleUnlink({ path }) {
    const {
      name,
      value: currentValue,
      valueDef,
      userTypedefs,
      strings,
      language,
      onChange,
    } = this.props;
  
    const nestedValueDef = getNestedTypedef(valueDef, path, userTypedefs);
    const resolvedValueDef = resolveTypedef(nestedValueDef, userTypedefs);
    const value = jssyValueToImmutable(buildDefaultValue(
      resolvedValueDef,
      strings,
      language,
    ));
    
    const newValue = path.length > 0
      ? currentValue.setInStatic(path, value)
      : value;
  
    onChange({ name, value: newValue });
  }

  _handleCheck({ path, checked }) {
    const {
      name,
      value: currentValue,
      valueDef,
      userTypedefs,
      strings,
      language,
      onChange,
    } = this.props;

    if (path.length > 0) {
      let newValue;

      if (checked) {
        const nestedValueDef = getNestedTypedef(valueDef, path, userTypedefs);
        const resolvedValueDef = resolveTypedef(nestedValueDef, userTypedefs);
        const value = jssyValueToImmutable(buildDefaultValue(
          resolvedValueDef,
          strings,
          language,
        ));

        newValue = currentValue.setInStatic(path, value);
      } else {
        newValue = currentValue.unsetInStatic(path);
      }

      onChange({ name, value: newValue });
    } else if (checked) {
      const resolvedValueDef = resolveTypedef(valueDef, userTypedefs);
      const value = jssyValueToImmutable(buildDefaultValue(
        resolvedValueDef,
        strings,
        language,
      ));

      onChange({ name, value });
    } else {
      onChange({ name, value: null });
    }
  }
  
  _handleConstructComponent({ path }) {
    const {
      name,
      valueDef,
      userTypedefs,
      onConstructComponent,
    } = this.props;
    
    onConstructComponent({
      name,
      path,
      targetValueDef: valueDef,
      targetUserTypedefs: userTypedefs,
    });
  }
  
  _isLinkableValue(valueDef) {
    const {
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
  
  _formatLabel(valueDef, fallback) {
    const { strings, language } = this.props;
    
    if (valueDef.textKey && strings && language)
      return getString(strings, valueDef.textKey, language);
    else
      return valueDef.label || fallback || '';
  }
  
  _formatTooltip(valueDef, fallback) {
    const { strings, language } = this.props;
  
    if (valueDef.descriptionTextKey && strings && language)
      return getString(strings, valueDef.descriptionTextKey, language);
    else
      return valueDef.description || fallback || '';
  }
  
  /**
   *
   * @param {number} index
   * @return {string}
   * @private
   */
  _formatArrayItemLabel(index) {
    return `Item ${index}`; // TODO: Get string from i18n
  }
  
  /**
   *
   * @param {string} key
   * @return {string}
   * @private
   */
  _formatObjectItemLabel(key) {
    return key;
  }

  /**
   *
   * @param {JssyValueDefinition} valueDef
   * @param {string} [labelFallback='']
   * @param {string} [descriptionFallback='']
   * @return {PropsItemPropType}
   * @private
   */
  _getPropType(valueDef, labelFallback = '', descriptionFallback = '') {
    const { userTypedefs, strings, language } = this.props;
    const resolvedValueDef = resolveTypedef(valueDef, userTypedefs);

    const ret = {
      label: this._formatLabel(resolvedValueDef, labelFallback),
      secondaryLabel: resolvedValueDef.type,
      view: isEditableValue(resolvedValueDef)
        ? jssyTypeToView(resolvedValueDef.type)
        : PropViews.EMPTY,
      image: '',
      tooltip: this._formatTooltip(resolvedValueDef, descriptionFallback),
      linkable: this._isLinkableValue(resolvedValueDef),
      checkable: !resolvedValueDef.required,
      required: !!resolvedValueDef.required,
      transformValue: null,
      formatItemLabel: returnArg,
    };

    if (resolvedValueDef.type === TypeNames.INT) {
      ret.transformValue = coerceIntValue;
    } else if (resolvedValueDef.type === TypeNames.FLOAT) {
      ret.transformValue = coerceFloatValue;
    } else if (resolvedValueDef.type === TypeNames.ONE_OF) {
      ret.options = resolvedValueDef.options.map(option => ({
        value: option.value,
        text: option.textKey
          ? getString(strings, option.textKey, language)
          : (option.label || String(option.value)),
      }));
    } else if (resolvedValueDef.type === TypeNames.SHAPE) {
      ret.fields = _mapValues(
        resolvedValueDef.fields,
        (fieldTypedef, fieldName) => this._getPropType(fieldTypedef, fieldName),
      );
    } else if (
      resolvedValueDef.type === TypeNames.ARRAY_OF ||
      resolvedValueDef.type === TypeNames.OBJECT_OF
    ) {
      ret.ofType = this._getPropType(resolvedValueDef.ofType);

      if (resolvedValueDef.type === TypeNames.ARRAY_OF)
        ret.formatItemLabel = this._formatArrayItemLabel;
      else
        ret.formatItemLabel = this._formatObjectItemLabel;
    }

    return ret;
  }

  /**
   *
   * @param {Object} jssyValue
   * @param {JssyValueDefinition} typedef
   * @return {PropsItemValue}
   * @private
   */
  _getPropValue(jssyValue, typedef) {
    const { userTypedefs } = this.props;

    if (!jssyValue) {
      return {
        value: makeDefaultNonNullValue(typedef, userTypedefs),
        linked: false,
        checked: false,
      };
    }

    const resolvedTypedef = resolveTypedef(typedef, userTypedefs);
    const linked = jssyValue.isLinked();
    let value = null;
    let linkedWith = '';

    if (!linked) {
      if (jssyValue.source === 'static') {
        if (
          resolvedTypedef.type === TypeNames.INT ||
          resolvedTypedef.type === TypeNames.FLOAT
        ) {
          value = String(jssyValue.sourceData.value);
        } else if (
          resolvedTypedef.type === TypeNames.STRING ||
          resolvedTypedef.type === TypeNames.BOOL ||
          resolvedTypedef.type === TypeNames.ONE_OF
        ) {
          value = jssyValue.sourceData.value;
        } else if (resolvedTypedef.type === TypeNames.SHAPE) {
          value = _mapValues(resolvedTypedef.fields, (fieldMeta, fieldName) =>
            this._getPropValue(
              jssyValue.sourceData.value.get(fieldName),
              fieldMeta,
            ),
          );
        } else if (resolvedTypedef.type === TypeNames.OBJECT_OF) {
          jssyValue.sourceData.value.map(nestedValue => this._getPropValue(
            nestedValue,
            resolvedTypedef.ofType,
          )).toJS();
        } else if (resolvedTypedef.type === TypeNames.ARRAY_OF) {
          value = jssyValue.sourceData.value.map(nestedValue =>
            this._getPropValue(
              nestedValue,
              resolvedTypedef.ofType,
            ),
          ).toJS();
        }
      } else if (jssyValue.source === 'designer') {
        // true if component exists, false otherwise
        if (resolvedTypedef.type === TypeNames.COMPONENT)
          value = jssyValue.sourceData.rootId !== -1;
      }
    } else if (jssyValue.source === 'data') {
      if (jssyValue.sourceData.queryPath) {
        linkedWith = jssyValue.sourceData.queryPath
          .map(step => step.field)
          .join(LINK_TEXT_ITEMS_SEPARATOR);
      }
    } else if (jssyValue.source === 'function') {
      linkedWith = jssyValue.sourceData.function;
    } else if (jssyValue.source === 'static') {
      linkedWith = jssyValue.sourceData.ownerPropName;
    } else if (jssyValue.source === 'state') {
      linkedWith = `Component ${jssyValue.sourceData.componentId}`;
    }

    return { value, linked, linkedWith, checked: true };
  }
  
  render() {
    const {
      name,
      value,
      valueDef,
      optional,
      label,
      description,
      getLocalizedText,
    } = this.props;

    const propType = {
      ...this._getPropType(valueDef, label, description),
      checkable: optional,
    };
    
    const propValue = this._getPropValue(value, valueDef);
    
    return (
      <Prop
        propName={name}
        propType={propType}
        value={propValue}
        getLocalizedText={getLocalizedText}
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
