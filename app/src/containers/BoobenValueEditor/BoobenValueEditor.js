import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _mapValues from 'lodash.mapvalues';

import {
  TypeNames,
  isEqualType,
  getNestedTypedef,
  resolveTypedef,
  isNullableType,
} from 'booben-types';

import BoobenValue from '../../models/BoobenValue';
import { boobenValueToImmutable } from '../../models/ProjectComponent';

import {
  Prop,
  boobenTypeToView,
  PropViews,
} from '../../components/PropsList/PropsList';

import {
  isValidSourceForValue,
  getString,
  buildDefaultValue,
} from '../../lib/meta';

import { noop, returnArg, objectSome } from '../../utils/misc';
import { INVALID_ID } from '../../constants/misc';

const propTypes = {
  name: PropTypes.string.isRequired,
  valueDef: PropTypes.object.isRequired,
  value: PropTypes.instanceOf(BoobenValue),
  optional: PropTypes.bool,
  userTypedefs: PropTypes.object,
  strings: PropTypes.object,
  language: PropTypes.string,
  ownerProps: PropTypes.object,
  ownerUserTypedefs: PropTypes.object,
  label: PropTypes.string,
  description: PropTypes.string,
  showType: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onChange: PropTypes.func,
  onLink: PropTypes.func,
  onConstructComponent: PropTypes.func,
  onEditActions: PropTypes.func,
  deletable: PropTypes.bool,
  simulateLeftOffset: PropTypes.bool,
  onDelete: PropTypes.func,
  id: PropTypes.string,
};

const defaultProps = {
  value: null,
  optional: false,
  userTypedefs: null,
  strings: null,
  language: '',
  ownerProps: null,
  ownerUserTypedefs: null,
  label: '',
  description: '',
  showType: false,
  getLocalizedText: returnArg,
  onChange: noop,
  onLink: noop,
  onConstructComponent: noop,
  onEditActions: noop,
  deletable: false,
  simulateLeftOffset: false,
  onDelete: noop,
  id: '',
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
 * @param {BoobenValueDefinition} valueDef
 * @return {boolean}
 */
const isEditableValue = valueDef =>
  isValidSourceForValue(valueDef, 'static') ||
  isValidSourceForValue(valueDef, 'designer') ||
  isValidSourceForValue(valueDef, 'actions');

/**
 *
 * @type {string}
 */
const LINK_TEXT_ITEMS_SEPARATOR = ' -> ';

export class BoobenValueEditor extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._propType = null;

    this._handleChange = this._handleChange.bind(this);
    this._handleAdd = this._handleAdd.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleUnlink = this._handleUnlink.bind(this);
    this._handleCheck = this._handleCheck.bind(this);
    this._handleConstructComponent = this._handleConstructComponent.bind(this);
    this._handleEditActions = this._handleEditActions.bind(this);

    this._formatArrayItemLabel = this._formatArrayItemLabel.bind(this);
    this._formatObjectItemLabel = this._formatObjectItemLabel.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.valueDef !== this.props.valueDef ||
      nextProps.userTypedefs !== this.props.userTypedefs ||
      nextProps.strings !== this.props.strings ||
      nextProps.language !== this.props.language
    ) {
      this._propType = null;
    }
  }

  /**
   *
   * @param {*} value
   * @param {(string|number)[]} path
   * @private
   */
  _handleChange({ value, path }) {
    const { name, value: currentValue, onChange } = this.props;

    const boobenValue = BoobenValue.staticFromJS(value);
    const newValue = path.length > 0
      ? currentValue.setInStatic(path, boobenValue)
      : boobenValue;

    onChange({ name, value: newValue });
  }

  /**
   *
   * @param {(string|number)[]} where
   * @param {string|number} index
   * @private
   */
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

    const nestedTypedef = getNestedTypedef(valueDef, where, userTypedefs);
    const value = boobenValueToImmutable(buildDefaultValue(
      nestedTypedef.ofType,
      strings,
      language,
      userTypedefs,
      { forceEnable: true },
    ));

    const newValue = where.length > 0
      ? currentValue.updateInStatic(
        where,
        nestedValue => nestedValue.addValueInStatic(index, value),
      )
      : currentValue.addValueInStatic(index, value);

    onChange({ name, value: newValue });
  }

  /**
   *
   * @param {(string|number)[]} where
   * @param {string|number} index
   * @private
   */
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

  /**
   *
   * @param {(string|number)[]} path
   * @private
   */
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
      targetValueDef: getNestedTypedef(valueDef, path, userTypedefs),
      targetUserTypedefs: userTypedefs,
      ownerProps,
      ownerUserTypedefs,
    });
  }

  /**
   *
   * @param {(string|number)[]} path
   * @private
   */
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
    const value = boobenValueToImmutable(buildDefaultValue(
      nestedValueDef,
      strings,
      language,
      userTypedefs,
      { forceEnable: true },
    ));

    const newValue = path.length > 0
      ? currentValue.setInStatic(path, value)
      : value;

    onChange({ name, value: newValue });
  }

  /**
   *
   * @param {(string|number)[]} path
   * @param {boolean} checked
   * @private
   */
  _handleCheck({ path, checked }) {
    const {
      name,
      value: currentValue,
      valueDef,
      userTypedefs,
      optional,
      strings,
      language,
      onChange,
    } = this.props;

    if (path.length > 0) {
      let newValue;

      const resolvedValueDef = resolveTypedef(
        getNestedTypedef(valueDef, path, userTypedefs),
        userTypedefs,
      );

      if (checked) {
        const value = boobenValueToImmutable(buildDefaultValue(
          resolvedValueDef,
          strings,
          language,
          userTypedefs,
          { forceEnable: true },
        ));

        newValue = currentValue.setInStatic(path, value);
      } else {
        const parentTypeDef = resolveTypedef(
          getNestedTypedef(valueDef, path.slice(0, -1), userTypedefs),
          userTypedefs,
        );

        const isIterable =
          parentTypeDef.type === TypeNames.ARRAY_OF ||
          parentTypeDef.type === TypeNames.OBJECT_OF;

        if (!isIterable && !resolvedValueDef.required) {
          newValue = currentValue.unsetInStatic(path);
        } else {
          newValue = currentValue.setInStatic(path, BoobenValue.STATIC_NULL);
        }
      }

      onChange({ name, value: newValue });
    } else {
      const resolvedValueDef = resolveTypedef(valueDef, userTypedefs);

      if (checked) {
        const value = boobenValueToImmutable(buildDefaultValue(
          resolvedValueDef,
          strings,
          language,
          userTypedefs,
          { forceEnable: true },
        ));

        onChange({ name, value });
      } else if (optional) {
        onChange({ name, value: null });
      } else {
        onChange({ name, value: BoobenValue.STATIC_NULL });
      }
    }
  }

  /**
   *
   * @param {(string|number)[]} path
   * @private
   */
  _handleConstructComponent({ path }) {
    const { name, valueDef, userTypedefs, onConstructComponent } = this.props;

    onConstructComponent({
      name,
      path,
      targetValueDef: valueDef,
      targetUserTypedefs: userTypedefs,
    });
  }

  /**
   *
   * @param {(string|number)[]} path
   * @private
   */
  _handleEditActions({ path }) {
    const { name, valueDef, userTypedefs, onEditActions } = this.props;

    onEditActions({
      name,
      path,
      targetValueDef: valueDef,
      targetUserTypedefs: userTypedefs,
    });
  }

  /**
   *
   * @param {BoobenValueDefinition} valueDef
   * @return {boolean}
   * @private
   */
  _isLinkableValue(valueDef) {
    const { userTypedefs, ownerProps, ownerUserTypedefs } = this.props;

    if (isValidSourceForValue(valueDef, 'data')) return true;
    if (isValidSourceForValue(valueDef, 'routeParams')) return true;
    if (isValidSourceForValue(valueDef, 'actionArg')) return true;
    if (isValidSourceForValue(valueDef, 'state')) return true;
    if (!isValidSourceForValue(valueDef, 'static') || !ownerProps) return false;

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

  /**
   *
   * @param {BoobenValueDefinition|ComponentPropMeta} valueDef
   * @param {string} [fallback='']
   * @param {string} [override='']
   * @return {string}
   * @private
   */
  _formatLabel(valueDef, fallback = '', override = '') {
    const { strings, language } = this.props;

    if (override) return override;

    if (valueDef.textKey && strings && language) {
      return getString(strings, valueDef.textKey, language);
    } else {
      return valueDef.label || fallback || '';
    }
  }

  /**
   *
   * @param {BoobenValueDefinition} valueDef
   * @return {string}
   * @private
   */
  _formatSecondaryLabel(valueDef) {
    if (isValidSourceForValue(valueDef, 'const')) {
      return `const ${valueDef.type}`;
    } else {
      return valueDef.type;
    }
  }

  /**
   *
   * @param {BoobenValueDefinition|ComponentPropMeta} valueDef
   * @param {string} [fallback='']
   * @param {string} [override='']
   * @return {string}
   * @private
   */
  _formatTooltip(valueDef, fallback = '', override = '') {
    const { strings, language } = this.props;

    if (override) return override;

    if (valueDef.descriptionTextKey && strings && language) {
      return getString(strings, valueDef.descriptionTextKey, language);
    } else {
      return valueDef.description || fallback || '';
    }
  }

  /**
   *
   * @param {number} index
   * @return {string}
   * @private
   */
  _formatArrayItemLabel(index) {
    const { getLocalizedText } = this.props;

    return getLocalizedText('valueEditor.arrayItemTitle', {
      index: String(index),
    });
  }

  /**
   *
   * @param {string} key
   * @return {string}
   * @private
   */
  _formatObjectItemLabel(key) {
    const { getLocalizedText } = this.props;
    return getLocalizedText('valueEditor.objectItemTitle', { key });
  }

  /**
   *
   * @param {BoobenValueDefinition} valueDef
   * @param {boolean} [noCache=false]
   * @param {string} [labelFallback='']
   * @param {string} [descriptionFallback='']
   * @param {string} [labelOverride='']
   * @param {string} [descriptionOverride='']
   * @param {boolean} [isIterableItem=false]
   * @return {PropsItemPropType}
   * @private
   */
  _getPropType(
    valueDef,
    {
      noCache = false,
      labelFallback = '',
      descriptionFallback = '',
      labelOverride = '',
      descriptionOverride = '',
      isIterableItem = false,
    } = {},
  ) {
    const { userTypedefs, strings, language, showType } = this.props;

    if (this._propType && !noCache) return this._propType;

    const resolvedValueDef = resolveTypedef(valueDef, userTypedefs);
    const checkable = (resolvedValueDef.required || isIterableItem)
      ? (isNullableType(resolvedValueDef.type) && !resolvedValueDef.notNull)
      : true;

    const ret = {
      label: this._formatLabel(resolvedValueDef, labelFallback, labelOverride),
      view: isEditableValue(resolvedValueDef)
        ? boobenTypeToView(resolvedValueDef.type)
        : PropViews.EMPTY,

      image: '',
      tooltip: this._formatTooltip(
        resolvedValueDef,
        descriptionFallback,
        descriptionOverride,
      ),

      linkable: this._isLinkableValue(resolvedValueDef),
      checkable,
      required: !!resolvedValueDef.required,
      transformValue: null,
      formatItemLabel: returnArg,
    };

    if (showType) {
      ret.secondaryLabel = this._formatSecondaryLabel(resolvedValueDef);
    }

    if (resolvedValueDef.type === TypeNames.INT) {
      ret.transformValue = coerceIntValue;
    } else if (resolvedValueDef.type === TypeNames.FLOAT) {
      ret.transformValue = coerceFloatValue;
    } else if (resolvedValueDef.type === TypeNames.ONE_OF) {
      if (ret.view === PropViews.LIST) {
        ret.options = resolvedValueDef.options.map(option => ({
          value: option.value,
          text: option.textKey
            ? getString(strings, option.textKey, language)
            : (option.label || String(option.value)),
        }));
      }
    } else if (resolvedValueDef.type === TypeNames.SHAPE) {
      if (ret.view === PropViews.SHAPE) {
        ret.fields = _mapValues(
          resolvedValueDef.fields,

          (fieldTypedef, fieldName) => this._getPropType(fieldTypedef, {
            noCache: true,
            labelFallback: fieldName,
          }),
        );
      }
    } else if (resolvedValueDef.type === TypeNames.ARRAY_OF) {
      if (ret.view === PropViews.ARRAY) {
        ret.ofType = this._getPropType(resolvedValueDef.ofType, {
          noCache: true,
          isIterableItem: true,
        });
      }

      ret.formatItemLabel = this._formatArrayItemLabel;
    } else if (resolvedValueDef.type === TypeNames.OBJECT_OF) {
      if (ret.view === PropViews.OBJECT) {
        ret.ofType = this._getPropType(resolvedValueDef.ofType, {
          noCache: true,
          isIterableItem: true,
        });
      }

      ret.formatItemLabel = this._formatObjectItemLabel;
    }

    if (!noCache) this._propType = ret;

    return ret;
  }

  /**
   *
   * @param {Object} boobenValue
   * @param {BoobenValueDefinition} valueDef
   * @return {PropsItemValue}
   * @private
   */
  _getPropValue(boobenValue, valueDef) {
    const { userTypedefs } = this.props;

    if (!boobenValue) {
      return {
        value: null,
        linked: false,
        checked: false,
      };
    }

    const resolvedValueDef = resolveTypedef(valueDef, userTypedefs);
    const linked = boobenValue.isLinked();
    let linkedWith = '';
    let value = null;
    let checked = true;

    if (!linked) {
      if (boobenValue.sourceIs(BoobenValue.Source.STATIC)) {
        if (
          resolvedValueDef.type === TypeNames.INT ||
          resolvedValueDef.type === TypeNames.FLOAT
        ) {
          value = String(boobenValue.sourceData.value);
        } else if (
          resolvedValueDef.type === TypeNames.STRING ||
          resolvedValueDef.type === TypeNames.BOOL ||
          resolvedValueDef.type === TypeNames.ONE_OF
        ) {
          value = boobenValue.sourceData.value;
        } else if (resolvedValueDef.type === TypeNames.SHAPE) {
          if (boobenValue.sourceData.value) {
            value = _mapValues(resolvedValueDef.fields, (fieldDef, fieldName) =>
              this._getPropValue(
                boobenValue.sourceData.value.get(fieldName),
                fieldDef,
              ),
            );
          } else {
            checked = false;
          }
        } else if (resolvedValueDef.type === TypeNames.OBJECT_OF) {
          if (boobenValue.sourceData.value) {
            value = boobenValue.sourceData.value.map(
              nestedValue => this._getPropValue(
                nestedValue,
                resolvedValueDef.ofType,
              ),
            ).toJS();
          } else {
            checked = false;
          }
        } else if (resolvedValueDef.type === TypeNames.ARRAY_OF) {
          value = boobenValue.sourceData.value.map(nestedValue =>
            this._getPropValue(
              nestedValue,
              resolvedValueDef.ofType,
            ),
          ).toJS();
        }
      } else if (boobenValue.sourceIs(BoobenValue.Source.DESIGNER)) {
        // true if component exists, false otherwise
        if (resolvedValueDef.type === TypeNames.COMPONENT) {
          value = boobenValue.sourceData.rootId !== INVALID_ID;
        }
      }
    } else if (boobenValue.sourceIs(BoobenValue.Source.DATA)) {
      if (boobenValue.sourceData.queryPath) {
        linkedWith = boobenValue.sourceData.queryPath
          .map(step => step.field)
          .join(LINK_TEXT_ITEMS_SEPARATOR);
      }
    } else if (boobenValue.sourceIs(BoobenValue.Source.FUNCTION)) {
      linkedWith = boobenValue.sourceData.function;
    } else if (boobenValue.sourceIs(BoobenValue.Source.OWNER_PROP)) {
      linkedWith = boobenValue.sourceData.ownerPropName;
    } else if (boobenValue.sourceIs(BoobenValue.Source.STATE)) {
      linkedWith =
        `Component ${boobenValue.sourceData.componentId} ` +
        `- ${boobenValue.sourceData.stateSlot}`;
    } else if (boobenValue.sourceIs(BoobenValue.Source.ROUTE_PARAMS)) {
      linkedWith = boobenValue.sourceData.paramName;
    } else if (boobenValue.sourceIs(BoobenValue.Source.ACTION_ARG)) {
      linkedWith = `Action argument ${boobenValue.sourceData.arg}`;
    }

    return { value, linked, linkedWith, checked };
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
      deletable,
      simulateLeftOffset,
      onDelete,
      id,
    } = this.props;

    const checkable =
      optional || (
        isNullableType(valueDef.type) &&
        !valueDef.notNull
      );

    const propType = {
      ...this._getPropType(valueDef, {
        labelOverride: label,
        descriptionOverride: description,
      }),

      checkable,
      deletable,
      simulateLeftOffset,
      onDelete,
      id,
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
        onCheck={this._handleCheck}
        onLink={this._handleLink}
        onUnlink={this._handleUnlink}
        onSetComponent={this._handleConstructComponent}
        onEditActions={this._handleEditActions}
      />
    );
  }
}

BoobenValueEditor.diplayName = 'BoobenValueEditor';
BoobenValueEditor.propTypes = propTypes;
BoobenValueEditor.defaultProps = defaultProps;
