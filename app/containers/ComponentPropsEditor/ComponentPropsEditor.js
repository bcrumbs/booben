/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import _mapValues from 'lodash.mapvalues';

import {
  PropsList,
  Prop,
  PropViews,
} from '../../components/PropsList/PropsList';

import {
  BlockContentBox,
  BlockContentBoxHeading,
  BlockContentBoxItem,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
  updateComponentPropValue,
  addComponentPropValue,
  deleteComponentPropValue,
  constructComponentForProp,
  linkProp,
} from '../../actions/project';

import {
  currentComponentsSelector,
  currentSelectedComponentIdsSelector,
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
} from '../../selectors';

import {
  getString,
  getComponentMeta,
  isCompatibleType,
  resolveTypedef,
  getNestedTypedef,
  buildDefaultValue,
  isValidSourceForProp,
} from '../../utils/meta';

import { NO_VALUE } from '../../constants/misc';
import { getLocalizedTextFromState } from '../../utils';
import { objectSome } from '../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  meta: PropTypes.object.isRequired,
  components: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
  ).isRequired,
  selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number).isRequired,
  language: PropTypes.string.isRequired,
  ownerComponentMeta: PropTypes.object,
  ownerProps: PropTypes.object,
  getLocalizedText: PropTypes.func.isRequired,

  onPropValueChange: PropTypes.func.isRequired,
  onAddPropValue: PropTypes.func.isRequired,
  onDeletePropValue: PropTypes.func.isRequired,
  onConstructComponent: PropTypes.func.isRequired,
  onLinkProp: PropTypes.func.isRequired,
  onUnlinkProp: PropTypes.func.isRequired,
};

const defaultProps = {
  ownerComponentMeta: null,
  ownerProps: null,
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
 * @param {Object} propMeta
 * @return {boolean}
 */
const isRenderableProp = propMeta =>
  isValidSourceForProp(propMeta, 'static') ||
  isValidSourceForProp(propMeta, 'function') ||
  isValidSourceForProp(propMeta, 'data') || (
    propMeta.type === 'component' &&
    isValidSourceForProp(propMeta, 'designer')
  );

/**
 *
 * @param {Object} propValue
 * @return {boolean}
 */
const isLinkedProp = propValue =>
  propValue.source === 'data' ||
  propValue.source === 'function' || (
    propValue.source === 'static' &&
    !!propValue.sourceData.ownerPropName
  );

const ownerComponentMetaSelector = createSelector(
  topNestedConstructorComponentSelector,
  state => state.project.meta,

  (ownerComponent, meta) => ownerComponent
    ? getComponentMeta(ownerComponent.name, meta)
    : null,
);

const ownerPropsSelector = createSelector(
  topNestedConstructorSelector,
  ownerComponentMetaSelector,

  (topNestedConstructor, ownerComponentMeta) => {
    if (!ownerComponentMeta) return null;

    const ownerComponentProp = topNestedConstructor.prop,
      ownerComponentPropMeta = ownerComponentMeta.props[ownerComponentProp];

    return ownerComponentPropMeta.source.indexOf('designer') > -1
      ? ownerComponentPropMeta.sourceConfigs.designer.props || null
      : null;
  },
);

/**
 *
 * @param {ComponentMeta} componentMeta
 * @param {ComponentPropMeta} propMeta
 * @param {Object} propValue
 * It is an {@link Immutable.Record} actually
 * (see app/models/ProjectComponentProp.js)
 * @return {*}
 */
const transformValue = (componentMeta, propMeta, propValue) => {
  if (!propValue) return { value: null, isLinked: false };

  const typedef = resolveTypedef(componentMeta, propMeta),
    linked = isLinkedProp(propValue);

  let value = null;
  let linkedWith = '';

  if (!linked) {
    if (propValue.source === 'static') {
      if (typedef.type === 'int' || typedef.type === 'float') {
        value = String(propValue.sourceData.value);
      } else if (
        typedef.type === 'string' ||
        typedef.type === 'bool' ||
        typedef.type === 'oneOf'
      ) {
        value = propValue.sourceData.value;
      } else if (typedef.type === 'shape') {
        value = _mapValues(typedef.fields, (fieldMeta, fieldName) =>
          transformValue(
            componentMeta,
            fieldMeta,
            propValue.sourceData.value.get(fieldName)),
          );
      } else if (typedef.type === 'objectOf') {
        propValue.sourceData.value.map(nestedValue =>
          transformValue(componentMeta, typedef.ofType, nestedValue)).toJS();
      } else if (typedef.type === 'arrayOf') {
        value = propValue.sourceData.value.map(nestedValue =>
          transformValue(componentMeta, typedef.ofType, nestedValue)).toJS();
      }
    } else if (propValue.source === 'designer') {
      // true if component exists, false otherwise
      if (typedef.type === 'component')
        value = propValue.sourceData.rootId !== -1;
    }
  } else if (propValue.source === 'data') {
    if (propValue.sourceData.queryPath) {
      linkedWith = propValue.sourceData.queryPath
        .map(step => step.field)
        .toJS()
        .join(' -> ');
    }
  } else if (propValue.source === 'function') {
    linkedWith = propValue.sourceData.function;
  } else if (propValue.source === 'static') {
    linkedWith = propValue.sourceData.ownerPropName;
  }

  return { value, linked, linkedWith };
};

/**
 *
 * @param {PropTypeDefinition} propMeta
 * @return {boolean}
 */
const isEditableProp = propMeta =>
  isValidSourceForProp(propMeta, 'static') ||
  isValidSourceForProp(propMeta, 'designer');

/**
 *
 * @type {Object<string, string>}
 * @const
 */
const propTypeToView = {
  string: PropViews.INPUT,
  bool: PropViews.TOGGLE,
  int: PropViews.INPUT,
  float: PropViews.INPUT,
  oneOf: PropViews.LIST,
  component: PropViews.COMPONENT,
  shape: PropViews.SHAPE,
  objectOf: PropViews.OBJECT,
  arrayOf: PropViews.ARRAY,
  object: PropViews.EMPTY,
  array: PropViews.EMPTY,
  func: PropViews.EMPTY,
};

class ComponentPropsEditorComponent extends PureComponent {
  constructor(props) {
    super(props);

    this._formatArrayItemLabel = this._formatArrayItemLabel.bind(this);
    this._formatObjectItemLabel = this._formatObjectItemLabel.bind(this);
    this._handleSetComponent = this._handleSetComponent.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleAddValue = this._handleAddValue.bind(this);
    this._handleDeleteValue = this._handleDeleteValue.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handleUnlink = this._handleUnlink.bind(this);
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
   * @param {string} propName
   * @param {(string|number)[]} path
   * @private
   */
  _handleSetComponent({ propName, path }) {
    const componentId = this.props.selectedComponentIds.first();
    this.props.onConstructComponent(componentId, propName, path);
  }

  /**
   *
   * @param {string} propName
   * @param {*} value
   * @param {(string|number)[]} path
   * @private
   */
  _handleChange({ propName, value, path }) {
    const componentId = this.props.selectedComponentIds.first();
    this.props.onPropValueChange(
      componentId,
      propName,
      path,
      'static',
      { value },
    );
  }

  /**
   *
   * @param {string} propName
   * @param {(string|number)[]} where
   * @param {string|number} index
   * @private
   */
  _handleAddValue({ propName, where, index }) {
    const componentId = this.props.selectedComponentIds.first(),
      component = this.props.components.get(componentId),
      componentMeta = getComponentMeta(component.name, this.props.meta),
      propMeta = componentMeta.props[propName],
      nestedPropMeta = getNestedTypedef(propMeta, where),
      newValueType = nestedPropMeta.ofType;

    const value = buildDefaultValue(
      componentMeta,
      newValueType,
      this.props.language,
    );

    if (value === NO_VALUE) {
      throw new Error(
        'Failed to construct a new value for ' +
        '\'arrayOf\' or \'objectOf\' prop. ' +
        `Component: '${component.name}', ` +
        `prop: '${propName}', ` +
        `where: ${where.map(String).join('.') || '[top level]'}`,
      );
    }

    this.props.onAddPropValue(
      componentId,
      propName,
      where,
      index,
      value.source,
      value.sourceData,
    );
  }

  /**
   *
   * @param {string} propName
   * @param {(string|number)[]} where
   * @param {string|number} index
   * @private
   */
  _handleDeleteValue({ propName, where, index }) {
    const componentId = this.props.selectedComponentIds.first();
    this.props.onDeletePropValue(componentId, propName, where, index);
  }

  /**
   *
   * @param {string} propName
   * @param {(string|number)[]} path
   * @private
   */
  _handleLink({ propName, path }) {
    const componentId = this.props.selectedComponentIds.first();
    this.props.onLinkProp(componentId, propName, path);
  }

  /**
   *
   * @param {string} propName
   * @param {(string|number)[]} path
   * @private
   */
  _handleUnlink({ propName, path }) {
    const componentId = this.props.selectedComponentIds.first();
    this.props.onUnlinkProp(componentId, propName, path);
  }

  /**
   *
   * @param {ComponentMeta} componentMeta
   * @param {ComponentPropMeta} propMeta
   * @return {boolean}
   * @private
   */
  _isPropLinkable(componentMeta, propMeta) {
    if (propMeta.source.indexOf('data') > -1) return true;
    if (propMeta.source.indexOf('function') > -1) return true;
    if (!this.props.ownerProps) return false;

    const propTypedef = resolveTypedef(componentMeta, propMeta);

    return objectSome(this.props.ownerProps, ownerProp => {
      if (ownerProp.dataContext) return false;

      const ownerPropTypedef = resolveTypedef(
        this.props.ownerComponentMeta,
        ownerProp,
      );

      return isCompatibleType(propTypedef, ownerPropTypedef);
    });
  }

  /**
   *
   * @param {ComponentMeta} componentMeta
   * @param {ComponentPropMeta} propMeta
   * @returns {PropsItemPropType}
   * @private
   */
  _propTypeFromMeta(componentMeta, propMeta) {
    // TODO: Memoize
    const typedef = resolveTypedef(componentMeta, propMeta);

    const name = getString(
      componentMeta,
      typedef.textKey,
      this.props.language,
    );

    const description = getString(
      componentMeta,
      typedef.descriptionTextKey,
      this.props.language,
    );

    const editable = isEditableProp(typedef),
      linkable = this._isPropLinkable(componentMeta, typedef);

    const ret = {
      label: name,
      secondaryLabel: typedef.type, // TODO: Get string from i18n
      view: editable ? propTypeToView[typedef.type] : PropViews.EMPTY,
      image: '',
      tooltip: description,
      linkable,
      checkable: false,
      required: false,
      transformValue: null,
      formatItemLabel: null,
    };

    if (editable) {
      if (typedef.type === 'int') {
        ret.transformValue = coerceIntValue;
      } else if (typedef.type === 'float') {
        ret.transformValue = coerceFloatValue;
      } else if (typedef.type === 'oneOf') {
        ret.options = typedef.options.map(option => ({
          value: option.value,
          text: getString(
              componentMeta,
              option.textKey,
              this.props.language,
          ) || option.textKey,
        }));
      } else if (typedef.type === 'shape') {
        ret.fields = _mapValues(
          typedef.fields,
          fieldMeta => this._propTypeFromMeta(componentMeta, fieldMeta),
        );
      } else if (typedef.type === 'arrayOf') {
        ret.ofType = this._propTypeFromMeta(componentMeta, typedef.ofType);
        ret.formatItemLabel = this._formatArrayItemLabel;
      } else if (typedef.type === 'objectOf') {
        ret.ofType = this._propTypeFromMeta(componentMeta, typedef.ofType);
        ret.formatItemLabel = this._formatObjectItemLabel;
      }
    }

    //noinspection JSValidateTypes
    return ret;
  }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {?ReactElement}
     * @private
     */
  _renderPropsItem(componentMeta, propName, propValue) {
    const { getLocalizedText } = this.props;

    const propMeta = componentMeta.props[propName],
      propType = this._propTypeFromMeta(componentMeta, propMeta),
      value = transformValue(componentMeta, propMeta, propValue);

    //noinspection JSValidateTypes
    return (
      <Prop
        key={propName}
        propName={propName}
        propType={propType}
        value={value}
        getLocalizedText={getLocalizedText}
        onChange={this._handleChange}
        onSetComponent={this._handleSetComponent}
        onAddValue={this._handleAddValue}
        onDeleteValue={this._handleDeleteValue}
        onLink={this._handleLink}
        onUnlink={this._handleUnlink}
      />
    );
  }

  render() {
    const { getLocalizedText } = this.props;

    if (this.props.selectedComponentIds.size === 0) {
      //noinspection JSCheckFunctionSignatures
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('selectAComponent')}
        />
      );
    }

    if (this.props.selectedComponentIds.size > 1) {
      //noinspection JSCheckFunctionSignatures
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('multipleComponentsSelected')}
        />
      );
    }

    const componentId = this.props.selectedComponentIds.first(),
      component = this.props.components.get(componentId),
      componentMeta = getComponentMeta(component.name, this.props.meta);

    if (!componentMeta) return null;

    const propGroups = componentMeta.propGroups.map(groupData => ({
      name: groupData.name,
      title: getString(
        componentMeta,
        groupData.textKey,
        this.props.language,
      ),
      props: [],
    }));

    const propsByGroup = new Map();
    propGroups.forEach(group => void propsByGroup.set(group.name, group.props));

    const propsWithoutGroup = [];

    const renderablePropNames = Object.keys(componentMeta.props)
      .filter(propName => isRenderableProp(componentMeta.props[propName]));

    if (renderablePropNames.length === 0) {
      //noinspection JSCheckFunctionSignatures
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('thisComponentDoesntHaveEditableAttributes')}
        />
      );
    }

    renderablePropNames.forEach(propName => {
      const propMeta = componentMeta.props[propName];
      if (propMeta.group) propsByGroup.get(propMeta.group).push(propName);
      else propsWithoutGroup.push(propName);
    });

    const content = [];

    propGroups.forEach(group => {
      content.push(
        <BlockContentBoxHeading key={`${group.name}__heading__`}>
          {group.title}
        </BlockContentBoxHeading>,
      );

      const controls = group.props.map(propName => this._renderPropsItem(
        componentMeta,
        propName,
        component.props.get(propName) || null,
      ));

      content.push(
        <BlockContentBoxItem key={group.name}>
          <PropsList>
            {controls}
          </PropsList>
        </BlockContentBoxItem>,
      );
    });

    if (propsWithoutGroup.length > 0) {
      const controls = propsWithoutGroup.map(propName => this._renderPropsItem(
        componentMeta,
        propName,
        component.props.get(propName) || null,
      ));

      content.push(
        <BlockContentBoxItem key="__no_group__">
          <PropsList>
            {controls}
          </PropsList>
        </BlockContentBoxItem>,
      );
    }

    return (
      <BlockContentBox isBordered>
        {content}
      </BlockContentBox>
    );
  }
}

ComponentPropsEditorComponent.propTypes = propTypes;
ComponentPropsEditorComponent.defaultProps = defaultProps;
ComponentPropsEditorComponent.dispalyName = 'ComponentPropsEditor';

const mapStateToProps = state => ({
  meta: state.project.meta,
  components: currentComponentsSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  language: state.app.language,
  ownerComponentMeta: ownerComponentMetaSelector(state),
  ownerProps: ownerPropsSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onPropValueChange: (componentId, propName, path, newSource, newSourceData) =>
    void dispatch(updateComponentPropValue(
      componentId,
      propName,
      path,
      newSource,
      newSourceData,
    )),

  onAddPropValue: (componentId, propName, path, index, source, sourceData) =>
    void dispatch(addComponentPropValue(
      componentId,
      propName,
      path,
      index,
      source,
      sourceData,
    )),

  onDeletePropValue: (componentId, propName, path, index) =>
    void dispatch(deleteComponentPropValue(componentId, propName, path, index)),

  onConstructComponent: (componentId, propName, path) =>
    void dispatch(constructComponentForProp(componentId, propName, path)),

  onLinkProp: (componentId, propName, path) =>
    void dispatch(linkProp(componentId, propName, path)),

  onUnlinkProp: () => {}, // TODO: Make unlink action
});

export const ComponentPropsEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentPropsEditorComponent);
