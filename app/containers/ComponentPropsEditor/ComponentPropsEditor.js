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
  TypeNames,
  isEqualType,
  resolveTypedef,
  getNestedTypedef,
} from '@jssy/types';

import {
  PropsList,
  Prop,
  PropViews,
  jssyTypeToView,
  jssyValueToPropValue,
} from '../../components/PropsList/PropsList';

import {
  BlockContentBox,
  BlockContentBoxHeading,
  BlockContentBoxItem,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
  updateJssyValue,
  addJssyValue,
  deleteJssyValue,
  constructComponentForProp,
  linkDialogOpen,
} from '../../actions/project';

import { PathStartingPoints } from '../../reducers/project';

import {
  currentComponentsSelector,
  currentSelectedComponentIdsSelector,
  topNestedConstructorSelector,
} from '../../selectors';

import {
  getString,
  getComponentMeta,
  buildDefaultValue,
  isValidSourceForValue,
  parseComponentName,
  formatComponentName,
  constructComponent,
} from '../../utils/meta';

import { NO_VALUE, SYSTEM_PROPS } from '../../constants/misc';
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
  ownerProps: PropTypes.object,
  ownerUserTypedefs: PropTypes.object,
  getLocalizedText: PropTypes.func.isRequired,

  onPropValueChange: PropTypes.func.isRequired,
  onAddPropValue: PropTypes.func.isRequired,
  onDeletePropValue: PropTypes.func.isRequired,
  onConstructComponent: PropTypes.func.isRequired,
  onLinkProp: PropTypes.func.isRequired,
};

const defaultProps = {
  ownerProps: null,
  ownerUserTypedefs: null,
};

const ownerPropsSelector = createSelector(
  topNestedConstructorSelector,
  
  topNestedConstructor => {
    if (!topNestedConstructor) return null;
    
    const ownerComponentPropMeta = topNestedConstructor.valueInfo.valueDef;
    
    return ownerComponentPropMeta.source.indexOf('designer') > -1
      ? ownerComponentPropMeta.sourceConfigs.designer.props || null
      : null;
  },
);

const ownerUserTypedefsSelector = createSelector(
  topNestedConstructorSelector,
  
  topNestedConstructor => {
    if (!topNestedConstructor) return null;
    return topNestedConstructor.valueInfo.userTypedefs;
  },
);

const mapStateToProps = state => ({
  meta: state.project.meta,
  components: currentComponentsSelector(state),
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  language: state.app.language,
  ownerProps: ownerPropsSelector(state),
  ownerUserTypedefs: ownerUserTypedefsSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onPropValueChange: (path, newSource, newSourceData) =>
    void dispatch(updateJssyValue(
      path,
      newSource,
      newSourceData,
    )),
  
  onAddPropValue: (path, index, source, sourceData) =>
    void dispatch(addJssyValue(
      path,
      index,
      source,
      sourceData,
    )),
  
  onDeletePropValue: (path, index) =>
    void dispatch(deleteJssyValue(path, index)),
  
  onConstructComponent: (path, components, rootId) =>
    void dispatch(constructComponentForProp(path, components, rootId)),
  
  onLinkProp: path => void dispatch(linkDialogOpen(path)),
});

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
  isValidSourceForValue(propMeta, 'static') ||
  isValidSourceForValue(propMeta, 'function') ||
  isValidSourceForValue(propMeta, 'data') || (
    propMeta.type === 'component' &&
    isValidSourceForValue(propMeta, 'designer')
  );

/**
 *
 * @param {JssyValueDefinition} propMeta
 * @return {boolean}
 */
const isEditableProp = propMeta =>
  isValidSourceForValue(propMeta, 'static') ||
  isValidSourceForValue(propMeta, 'designer');

/**
 *
 * @param {number} componentId
 * @param {boolean} isSystemProp
 * @param {string} propName
 * @param {(string|number)[]} path
 * @return {Path}
 */
const buildFullPath = (componentId, isSystemProp, propName, path) => ({
  startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
  steps: [
    componentId,
    isSystemProp ? 'systemProps' : 'props',
    propName,
    ...path,
  ],
});

class ComponentPropsEditorComponent extends PureComponent {
  constructor(props) {
    super(props);

    this._formatArrayItemLabel = this._formatArrayItemLabel.bind(this);
    this._formatObjectItemLabel = this._formatObjectItemLabel.bind(this);
  
    this._handleSystemPropSetComponent =
      this._handleSetComponent.bind(this, true);
    this._handleSystemPropChange = this._handleChange.bind(this, true);
    this._handleSystemPropAddValue = this._handleAddValue.bind(this, true);
    this._handleSystemPropDeleteValue =
      this._handleDeleteValue.bind(this, true);
    this._handleSystemPropLink = this._handleLink.bind(this, true);
    this._handleSystemPropUnlink = this._handleUnlink.bind(this, true);
  
    this._handleSetComponent = this._handleSetComponent.bind(this, false);
    this._handleChange = this._handleChange.bind(this, false);
    this._handleAddValue = this._handleAddValue.bind(this, false);
    this._handleDeleteValue = this._handleDeleteValue.bind(this, false);
    this._handleLink = this._handleLink.bind(this, false);
    this._handleUnlink = this._handleUnlink.bind(this, false);
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
   * @param {boolean} isSystemProp
   * @param {string} propName
   * @param {(string|number)[]} path
   * @private
   */
  _handleSetComponent(isSystemProp, { propName, path }) {
    const {
      meta,
      components,
      selectedComponentIds,
      language,
      onConstructComponent,
    } = this.props;
    
    const componentId = selectedComponentIds.first();
    const component = components.get(componentId);
    const currentPropValue = isSystemProp
      ? component.systemProps.get(propName)
      : component.props.get(propName);
    
    const currentValue = currentPropValue.getInStatic(path);
    const componentMeta = getComponentMeta(component.name, meta);
    const valueMeta = getNestedTypedef(
      componentMeta.props[propName],
      path,
      componentMeta.types,
    );
  
    let initialComponents = null;
    let initialComponentsRootId = -1;
    
    const willBuildWrapper =
      !currentValue.hasDesignedComponent() &&
      !!valueMeta.sourceConfigs.designer.wrapper;
    
    if (willBuildWrapper) {
      const { namespace } = parseComponentName(component.name);
  
      const wrapperFullName = formatComponentName(
        namespace,
        valueMeta.sourceConfigs.designer.wrapper,
      );
  
      initialComponents = constructComponent(
        wrapperFullName,
        valueMeta.sourceConfigs.designer.wrapperLayout || 0,
        language,
        meta,
        { isNew: false, isWrapper: true },
      );
  
      initialComponentsRootId = 0;
    }
    
    const fullPath = buildFullPath(componentId, isSystemProp, propName, path);
    onConstructComponent(fullPath, initialComponents, initialComponentsRootId);
  }

  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} propName
   * @param {*} value
   * @param {(string|number)[]} path
   * @private
   */
  _handleChange(isSystemProp, { propName, value, path }) {
    const { selectedComponentIds, onPropValueChange } = this.props;
    
    const componentId = selectedComponentIds.first();
    const fullPath = buildFullPath(componentId, isSystemProp, propName, path);
    onPropValueChange(fullPath, 'static', { value });
  }

  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} propName
   * @param {(string|number)[]} where
   * @param {string|number} index
   * @private
   */
  _handleAddValue(isSystemProp, { propName, where, index }) {
    const {
      meta,
      components,
      selectedComponentIds,
      language,
      onAddPropValue,
    } = this.props;
    
    const componentId = selectedComponentIds.first();
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);
    const propMeta = isSystemProp
      ? SYSTEM_PROPS[propName]
      : componentMeta.props[propName];
    
    const nestedPropMeta = getNestedTypedef(
      propMeta,
      where,
      isSystemProp ? null : componentMeta.types,
    );
    
    const newValueType = resolveTypedef(
      nestedPropMeta.ofType,
      isSystemProp ? null : componentMeta.types,
    );

    const value = buildDefaultValue(
      newValueType,
      isSystemProp ? null : componentMeta.strings,
      language,
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
  
    const fullPath = buildFullPath(componentId, isSystemProp, propName, where);
    onAddPropValue(fullPath, index, value.source, value.sourceData);
  }

  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} propName
   * @param {(string|number)[]} where
   * @param {string|number} index
   * @private
   */
  _handleDeleteValue(isSystemProp, { propName, where, index }) {
    const { selectedComponentIds, onDeletePropValue } = this.props;
    
    const componentId = selectedComponentIds.first();
    const fullPath = buildFullPath(componentId, isSystemProp, propName, where);
    onDeletePropValue(fullPath, index);
  }

  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} propName
   * @param {(string|number)[]} path
   * @private
   */
  _handleLink(isSystemProp, { propName, path }) {
    const { selectedComponentIds, onLinkProp } = this.props;
    
    const componentId = selectedComponentIds.first();
    const fullPath = buildFullPath(componentId, isSystemProp, propName, path);
    onLinkProp(fullPath);
  }

  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} propName
   * @param {(string|number)[]} path
   * @private
   */
  _handleUnlink(isSystemProp, { propName, path }) {
    const {
      meta,
      components,
      selectedComponentIds,
      language,
      onPropValueChange,
    } = this.props;
    
    const componentId = selectedComponentIds.first();
    const component = components.get(componentId);
    const componentMeta = getComponentMeta(component.name, meta);
    const propMeta = isSystemProp
      ? SYSTEM_PROPS[propName]
      : componentMeta.props[propName];
    
    const nestedMeta = getNestedTypedef(
      propMeta,
      path,
      isSystemProp ? null : componentMeta.types,
    );
    
    const { source, sourceData } = buildDefaultValue(
      nestedMeta,
      isSystemProp ? null : componentMeta.strings,
      language,
    );
    
    const fullPath = buildFullPath(componentId, isSystemProp, propName, path);
    onPropValueChange(fullPath, source, sourceData);
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

    return objectSome(this.props.ownerProps, ownerProp => {
      if (ownerProp.dataContext) return false;

      return isEqualType(
        propMeta,
        ownerProp,
        componentMeta.types,
        this.props.ownerUserTypedefs,
      );
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
    const typedef = resolveTypedef(propMeta, componentMeta.types);

    const name = getString(
      componentMeta.strings,
      typedef.textKey,
      this.props.language,
    );

    const description = getString(
      componentMeta.strings,
      typedef.descriptionTextKey,
      this.props.language,
    );

    const editable = isEditableProp(typedef);
    const linkable = this._isPropLinkable(componentMeta, typedef);

    const ret = {
      label: name,
      secondaryLabel: typedef.type, // TODO: Get string from i18n
      view: editable ? jssyTypeToView(typedef.type) : PropViews.EMPTY,
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
              componentMeta.strings,
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

    const propMeta = componentMeta.props[propName];
    const propType = this._propTypeFromMeta(componentMeta, propMeta);
    const value = jssyValueToPropValue(
      propValue,
      propMeta,
      componentMeta.types,
    );

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
  
  /**
   *
   * @param {Object} component
   * @return {ReactElement}
   * @private
   */
  _renderSystemProps(component) {
    const { getLocalizedText } = this.props;
    
    const visiblePropType = {
      label: getLocalizedText('propsEditor.systemProps.visible.name'),
      secondaryLabel: TypeNames.BOOL,
      view: PropViews.TOGGLE,
      image: '',
      tooltip: getLocalizedText('propsEditor.systemProps.visible.desc'),
      linkable: true,
      checkable: false,
      required: false,
      transformValue: null,
      formatItemLabel: null,
    };
    
    const visibleValue = jssyValueToPropValue(
      component.systemProps.get('visible'),
      SYSTEM_PROPS.visible,
    );
    
    //noinspection JSValidateTypes
    return (
      <BlockContentBoxItem key="__system_props__">
        <PropsList>
          <Prop
            propName="visible"
            propType={visiblePropType}
            value={visibleValue}
            getLocalizedText={getLocalizedText}
            onChange={this._handleSystemPropChange}
            onSetComponent={this._handleSystemPropSetComponent}
            onAddValue={this._handleSystemPropAddValue}
            onDeleteValue={this._handleSystemPropDeleteValue}
            onLink={this._handleSystemPropLink}
            onUnlink={this._handleSystemPropUnlink}
          />
        </PropsList>
      </BlockContentBoxItem>
    );
  }

  render() {
    const { selectedComponentIds, getLocalizedText } = this.props;

    if (selectedComponentIds.size === 0) {
      //noinspection JSCheckFunctionSignatures
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('selectAComponent')}
        />
      );
    }

    if (selectedComponentIds.size > 1) {
      //noinspection JSCheckFunctionSignatures
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('multipleComponentsSelected')}
        />
      );
    }

    const componentId = selectedComponentIds.first();
    const component = this.props.components.get(componentId);
    const componentMeta = getComponentMeta(component.name, this.props.meta);

    if (!componentMeta) return null;

    const propGroups = componentMeta.propGroups.map(groupData => ({
      name: groupData.name,
      title: getString(
        componentMeta.strings,
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
    
    const systemProps = this._renderSystemProps(component);

    return (
      <BlockContentBox isBordered>
        {systemProps}
        {content}
      </BlockContentBox>
    );
  }
}

ComponentPropsEditorComponent.propTypes = propTypes;
ComponentPropsEditorComponent.defaultProps = defaultProps;
ComponentPropsEditorComponent.dispalyName = 'ComponentPropsEditor';

export const ComponentPropsEditor = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentPropsEditorComponent);
