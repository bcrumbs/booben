/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@reactackle/reactackle';

import {
  BlockContentBox,
  BlockContentBoxHeading,
  BlockContentBoxItem,
  BlockContentPlaceholder,
} from '@jssy/common-ui';

import { getNestedTypedef, isCompatibleType } from '@jssy/types';
import { DesignDialog } from '../DesignDialog/DesignDialog';
import { PropsList } from '../../components/PropsList/PropsList';
import { JssyValueEditor } from '../JssyValueEditor/JssyValueEditor';
import { ActionEditor } from '../ActionEditor/ActionEditor';
import { ActionsList } from '../ActionsList/ActionsList';
import { LinkPropWindow } from '../LinkPropWindow/LinkPropWindow';
import JssyValue from '../../models/JssyValue';
import SourceDataState from '../../models/SourceDataState';

import {
  replaceJssyValue,
  constructComponentForProp,
  pickComponentStateSlot,
  addAction,
  replaceAction,
  deleteAction,
} from '../../actions/project';

import { PathStartingPoints } from '../../reducers/project';

import {
  currentComponentsSelector,
  selectedComponentIdsSelector,
  ownerPropsSelector,
  ownerUserTypedefsSelector,
  getLocalizedTextFromState,
} from '../../selectors';

import {
  getString,
  getComponentMeta,
  isValidSourceForValue,
  getSourceConfig,
  parseComponentName,
  formatComponentName,
  constructComponent,
} from '../../lib/meta';

import { INVALID_ID, SYSTEM_PROPS } from '../../constants/misc';
import * as JssyPropTypes from '../../constants/common-prop-types';
import { objectSome } from '../../utils/misc';

const propTypes = {
  meta: PropTypes.object.isRequired,
  components: JssyPropTypes.components.isRequired,
  selectedComponentIds: JssyPropTypes.setOfIds.isRequired,
  language: PropTypes.string.isRequired,
  ownerProps: PropTypes.object,
  ownerUserTypedefs: PropTypes.object,
  pickingComponentStateSlot: PropTypes.bool.isRequired,
  pickedComponentId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  pickedComponentStateSlot: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  getLocalizedText: PropTypes.func.isRequired,
  onReplacePropValue: PropTypes.func.isRequired,
  onConstructComponent: PropTypes.func.isRequired,
  onPickComponentStateSlot: PropTypes.func.isRequired,
  onAddAction: PropTypes.func.isRequired,
  onReplaceAction: PropTypes.func.isRequired,
  onDeleteAction: PropTypes.func.isRequired,
};

const defaultProps = {
  ownerProps: null,
  ownerUserTypedefs: null,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  components: currentComponentsSelector(state),
  selectedComponentIds: selectedComponentIdsSelector(state),
  language: state.app.language,
  ownerProps: ownerPropsSelector(state),
  ownerUserTypedefs: ownerUserTypedefsSelector(state),
  pickingComponentStateSlot: state.project.pickingComponentStateSlot,
  pickedComponentId: state.project.pickedComponentId,
  pickedComponentStateSlot: state.project.pickedComponentStateSlot,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onReplacePropValue: (path, newValue) =>
    void dispatch(replaceJssyValue(path, newValue)),
  
  onConstructComponent: (path, components, rootId) =>
    void dispatch(constructComponentForProp(path, components, rootId)),

  onPickComponentStateSlot: (filter, stateSlotsFilter) =>
    void dispatch(pickComponentStateSlot(filter, stateSlotsFilter)),
  
  onAddAction: ({ path, action }) =>
    void dispatch(addAction(path, action)),
  
  onReplaceAction: ({ path, index, newAction }) =>
    void dispatch(replaceAction(path, index, newAction)),
  
  onDeleteAction: ({ path, index }) =>
    void dispatch(deleteAction(path, index)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

/**
 *
 * @param {Object} propMeta
 * @return {boolean}
 */
const isRenderableProp = propMeta =>
  isValidSourceForValue(propMeta, 'static') ||
  isValidSourceForValue(propMeta, 'state') ||
  isValidSourceForValue(propMeta, 'function') ||
  isValidSourceForValue(propMeta, 'data') || (
    propMeta.type === 'component' &&
    isValidSourceForValue(propMeta, 'designer')
  );

/**
 *
 * @param {number} componentId
 * @param {boolean} isSystemProp
 * @param {string} propName
 * @param {(string|number)[]} [path=[]]
 * @return {Path}
 */
const buildFullPath = (componentId, isSystemProp, propName, path = []) => ({
  startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
  steps: [
    componentId,
    isSystemProp ? 'systemProps' : 'props',
    propName,
    ...path,
  ],
});

/**
 *
 * @param {number} componentId
 * @param {boolean} isSystemProp
 * @param {string} propName
 * @param {(string|number)[]} [path=[]]
 * @param {(string|number)[]} [pathToActionsList=[]]
 * @return {Path}
 */
const buildFullPathToActionsList = (
  componentId,
  isSystemProp,
  propName,
  path = [],
  pathToActionsList = [],
) => ({
  startingPoint: PathStartingPoints.CURRENT_COMPONENTS,
  steps: [
    componentId,
    isSystemProp ? 'systemProps' : 'props',
    propName,
    ...path,
    'actions',
    ...pathToActionsList,
  ],
});

const ActionEditorViews = {
  LIST: 0,
  NEW: 1,
  EDIT: 2,
};

class ComponentPropsEditorComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      linkingProp: false,
      linkingPath: null,
      linkingValueDef: null,
      linkWindowName: '',
      pickingPath: null,
      editingActions: false,
      editingActionsForProp: '',
      editingActionsForPath: null,
      editingActionsForSystemProp: false,
      actionEditorView: ActionEditorViews.LIST,
      pathToActionsList: null, // For new action
      actionPath: null, // For editing action
    };
  
    this._handleSystemPropSetComponent =
      this._handleSetComponent.bind(this, true);
    this._handleSystemPropEditActions =
      this._handleEditActions.bind(this, true);
    this._handleSystemPropChange = this._handleChange.bind(this, true);
    this._handleSystemPropLink = this._handleLink.bind(this, true);
    this._handleSystemPropPick = this._handlePick.bind(this, true);
  
    this._handleSetComponent = this._handleSetComponent.bind(this, false);
    this._handleEditActions = this._handleEditActions.bind(this, false);
    this._handleChange = this._handleChange.bind(this, false);
    this._handleLink = this._handleLink.bind(this, false);
    this._handlePick = this._handlePick.bind(this, false);
    
    this._handleLinkApply = this._handleLinkApply.bind(this);
    this._handleLinkCancel = this._handleLinkCancel.bind(this);
    this._handlePickApply = this._handlePickApply.bind(this);
    this._handleCreateAction = this._handleCreateAction.bind(this);
    this._handleEditAction = this._handleEditAction.bind(this);
    this._handleDeleteAction = this._handleDeleteAction.bind(this);
    this._handleActionEditorSave = this._handleActionEditorSave.bind(this);
    this._handleActionEditorCancel = this._handleActionEditorCancel.bind(this);
    this._handleCloseActionsEditor = this._handleCloseActionsEditor.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { pickingComponentStateSlot } = this.props;

    if (pickingComponentStateSlot && !nextProps.pickingComponentStateSlot) {
      this._handlePickApply({
        componentId: nextProps.pickedComponentId,
        stateSlot: nextProps.pickedComponentStateSlot,
      });
    }
  }
  
  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} name
   * @param {*} value
   * @private
   */
  _handleChange(isSystemProp, { name, value }) {
    const { selectedComponentIds, onReplacePropValue } = this.props;
    
    const componentId = selectedComponentIds.first();
    const fullPath = buildFullPath(componentId, isSystemProp, name);
    onReplacePropValue(fullPath, value);
  }
  
  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} name
   * @param {(string|number)[]} path
   * @private
   */
  _handleLink(isSystemProp, { name, path }) {
    const { meta, components, selectedComponentIds } = this.props;
  
    const componentId = selectedComponentIds.first();
    
    let linkingValueDef;
    if (isSystemProp) {
      const propMeta = SYSTEM_PROPS[name];
      linkingValueDef = getNestedTypedef(propMeta, path);
    } else {
      const component = components.get(componentId);
      const componentMeta = getComponentMeta(component.name, meta);
      const propMeta = componentMeta.props[name];
      linkingValueDef = getNestedTypedef(propMeta, path, componentMeta.types);
    }
    
    this.setState({
      linkingProp: true,
      linkingPath: buildFullPath(componentId, isSystemProp, name, path),
      linkingValueDef,
      linkWindowName: [name, ...path].join('.'),
    });
  }
  
  _handleLinkApply({ newValue }) {
    const { onReplacePropValue } = this.props;
    const { linkingPath } = this.state;
    
    this.setState({
      linkingProp: false,
      linkingPath: null,
      linkingValueDef: null,
      linkWindowName: '',
    });
    
    onReplacePropValue(linkingPath, newValue);
  }
  
  _handleLinkCancel() {
    this.setState({
      linkingProp: false,
      linkingPath: null,
      linkingValueDef: null,
      linkWindowName: '',
    });
  }

  _handlePick(isSystemProp, { name, path }) {
    const {
      meta,
      components,
      selectedComponentIds,
      onPickComponentStateSlot,
    } = this.props;

    const componentId = selectedComponentIds.first();

    let linkingValueDef;
    if (isSystemProp) {
      const propMeta = SYSTEM_PROPS[name];
      linkingValueDef = getNestedTypedef(propMeta, path);
    } else {
      const component = components.get(componentId);
      const componentMeta = getComponentMeta(component.name, meta);
      const propMeta = componentMeta.props[name];
      linkingValueDef = getNestedTypedef(propMeta, path, componentMeta.types);
    }

    const filter = sourceComponentId => {
      const sourceComponent = components.get(sourceComponentId);
      const sourceComponentMeta = getComponentMeta(sourceComponent.name, meta);

      if (!sourceComponentMeta.state) return false;

      return objectSome(
        sourceComponentMeta.state,
        stateSlot => isCompatibleType(linkingValueDef, stateSlot),
      );
    };

    const stateSlotFilter = stateSlot =>
      isCompatibleType(linkingValueDef, stateSlot);

    this.setState({
      pickingPath: buildFullPath(componentId, isSystemProp, name, path),
    });

    onPickComponentStateSlot(filter, stateSlotFilter);
  }

  _handlePickApply({ componentId, stateSlot }) {
    const { onReplacePropValue } = this.props;
    const { pickingPath } = this.state;
    
    if (componentId === INVALID_ID) return;

    const newValue = new JssyValue({
      source: 'state',
      sourceData: new SourceDataState({ componentId, stateSlot }),
    });

    onReplacePropValue(pickingPath, newValue);
  }

  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} name
   * @param {(string|number)[]} path
   * @private
   */
  _handleSetComponent(isSystemProp, { name, path }) {
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
      ? component.systemProps.get(name)
      : component.props.get(name);
    
    const currentValue = currentPropValue.getInStatic(path);
    const componentMeta = getComponentMeta(component.name, meta);
    const valueMeta = getNestedTypedef(
      componentMeta.props[name],
      path,
      componentMeta.types,
    );
    
    const designerSourceConfig =
      getSourceConfig(valueMeta, 'designer', componentMeta.types);
  
    let initialComponents = null;
    let initialComponentsRootId = INVALID_ID;
    
    const willBuildWrapper =
      !currentValue.hasDesignedComponent() &&
      !!designerSourceConfig.wrapper;
    
    if (willBuildWrapper) {
      const { namespace } = parseComponentName(component.name);
  
      const wrapperFullName = formatComponentName(
        namespace,
        designerSourceConfig.wrapper,
      );
  
      initialComponents = constructComponent(
        wrapperFullName,
        designerSourceConfig.wrapperLayout || 0,
        language,
        meta,
        { isNew: false, isWrapper: true },
      );
  
      initialComponentsRootId = 0;
    }
    
    const fullPath = buildFullPath(componentId, isSystemProp, name, path);
    onConstructComponent(fullPath, initialComponents, initialComponentsRootId);
  }
  
  /**
   *
   * @param {boolean} isSystemProp
   * @param {string} name
   * @param {(string|number)[]} path
   * @private
   */
  _handleEditActions(isSystemProp, { name, path }) {
    this.setState({
      editingActions: true,
      editingActionsForProp: name,
      editingActionsForSystemProp: isSystemProp,
      editingActionsForPath: path,
      actionEditorView: ActionEditorViews.LIST,
      pathToActionsList: null,
      actionPath: null,
    });
  }
  
  /**
   *
   * @param {(string|number)[]} pathToList
   * @private
   */
  _handleCreateAction({ pathToList }) {
    this.setState({
      actionEditorView: ActionEditorViews.NEW,
      pathToActionsList: pathToList,
    });
  }
  
  /**
   *
   * @param {(string|number)[]} actionPath
   * @private
   */
  _handleEditAction({ actionPath }) {
    this.setState({
      actionEditorView: ActionEditorViews.EDIT,
      actionPath,
    });
  }
  
  /**
   *
   * @param {(string|number)[]} actionPath
   * @private
   */
  _handleDeleteAction({ actionPath }) {
    const { selectedComponentIds, onDeleteAction } = this.props;
    
    const {
      editingActionsForProp,
      editingActionsForSystemProp,
      editingActionsForPath,
    } = this.state;
  
    const componentId = selectedComponentIds.first();
    const pathToList = actionPath.slice(0, -1);
    const index = actionPath[actionPath.length - 1];
    const path = buildFullPathToActionsList(
      componentId,
      editingActionsForSystemProp,
      editingActionsForProp,
      editingActionsForPath,
      pathToList,
    );
  
    onDeleteAction({ path, index });
  }
  
  /**
   *
   * @param {Object} action
   * @private
   */
  _handleActionEditorSave({ action }) {
    const { selectedComponentIds, onAddAction, onReplaceAction } = this.props;
    
    const {
      actionEditorView,
      editingActionsForProp,
      editingActionsForSystemProp,
      editingActionsForPath,
      actionPath,
      pathToActionsList,
    } = this.state;
    
    const componentId = selectedComponentIds.first();
    
    if (actionEditorView === ActionEditorViews.NEW) {
      const path = buildFullPathToActionsList(
        componentId,
        editingActionsForSystemProp,
        editingActionsForProp,
        editingActionsForPath,
        pathToActionsList,
      );
      
      onAddAction({ path, action });
    } else if (actionEditorView === ActionEditorViews.EDIT) {
      const pathToList = actionPath.slice(0, -1);
      const index = actionPath[actionPath.length - 1];
      const path = buildFullPathToActionsList(
        componentId,
        editingActionsForSystemProp,
        editingActionsForProp,
        editingActionsForPath,
        pathToList,
      );
      
      onReplaceAction({ path, index, newAction: action });
    }
    
    this.setState({
      actionEditorView: ActionEditorViews.LIST,
      actionPath: null,
      pathToActionsList: null,
    });
  }
  
  /**
   *
   * @private
   */
  _handleActionEditorCancel() {
    this.setState({
      actionEditorView: ActionEditorViews.LIST,
      actionPath: null,
      pathToActionsList: null,
    });
  }
  
  /**
   *
   * @private
   */
  _handleCloseActionsEditor() {
    this.setState({
      editingActions: false,
      actionEditorView: ActionEditorViews.LIST,
      editingActionsForProp: '',
      editingActionsForSystemProp: false,
      editingActionsForPath: null,
      actionPath: null,
      pathToActionsList: null,
    });
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
    const {
      ownerProps,
      ownerUserTypedefs,
      language,
      getLocalizedText,
    } = this.props;

    const propMeta = componentMeta.props[propName];
    const isOptional = propMeta.required === false;
    
    return (
      <JssyValueEditor
        key={propName}
        name={propName}
        value={propValue}
        valueDef={propMeta}
        optional={isOptional}
        userTypedefs={componentMeta.types}
        strings={componentMeta.strings}
        language={language}
        ownerProps={ownerProps}
        ownerUserTypedefs={ownerUserTypedefs}
        getLocalizedText={getLocalizedText}
        onChange={this._handleChange}
        onLink={this._handleLink}
        onPick={this._handlePick}
        onConstructComponent={this._handleSetComponent}
        onEditActions={this._handleEditActions}
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
    const {
      ownerProps,
      ownerUserTypedefs,
      language,
      getLocalizedText,
    } = this.props;
    
    const { editingActions } = this.state;
    
    const visibleLabel =
      getLocalizedText('propsEditor.systemProps.visible.name');
    
    const visibleDesc =
      getLocalizedText('propsEditor.systemProps.visible.desc');
    
    return (
      <BlockContentBoxItem
        key="__system_props__"
        hidden={editingActions}
      >
        <PropsList>
          <JssyValueEditor
            name="visible"
            value={component.systemProps.get('visible')}
            valueDef={SYSTEM_PROPS.visible}
            label={visibleLabel}
            description={visibleDesc}
            language={language}
            ownerProps={ownerProps}
            ownerUserTypedefs={ownerUserTypedefs}
            getLocalizedText={getLocalizedText}
            onChange={this._handleSystemPropChange}
            onLink={this._handleSystemPropLink}
            onPick={this._handleSystemPropPick}
            onConstructComponent={this._handleSystemPropSetComponent}
            onEditActions={this._handleSystemPropEditActions}
          />
        </PropsList>
      </BlockContentBoxItem>
    );
  }
  
  /**
   *
   * @return {?ReactElement}
   * @private
   */
  _renderActionsEditor() {
    const { selectedComponentIds, getLocalizedText } = this.props;
    
    const {
      editingActions,
      editingActionsForProp,
      editingActionsForSystemProp,
      editingActionsForPath,
      actionEditorView,
      actionPath,
    } = this.state;
    
    if (!editingActions) return null;
  
    const component = selectedComponentIds.first();
    const propValue = editingActionsForSystemProp
      ? component.systemProps.get(editingActionsForProp)
      : component.props.get(editingActionsForProp);
  
    const value = propValue.getInStatic(editingActionsForPath);
    
    switch (actionEditorView) {
      case ActionEditorViews.LIST: {
        // TODO: Find a better place for the Back button
        return (
          <BlockContentBoxItem isBordered flexMain>
            <ActionsList
              actions={value.actions}
              onCreateAction={this._handleCreateAction}
              onEditAction={this._handleEditAction}
              onDeleteAction={this._handleDeleteAction}
            />
            
            <Button
              text={getLocalizedText('common.back')}
              onPress={this._handleCloseActionsEditor}
            />
          </BlockContentBoxItem>
        );
      }
      
      case ActionEditorViews.NEW: {
        return (
          <ActionEditor
            onSave={this._handleActionEditorSave}
            onCancel={this._handleActionEditorCancel}
          />
        );
      }
  
      case ActionEditorViews.EDIT: {
        const action = value.getActionByPath(actionPath);
        
        return (
          <ActionEditor
            action={action}
            onSave={this._handleActionEditorSave}
            onCancel={this._handleActionEditorCancel}
          />
        );
      }
      
      default: {
        return null;
      }
    }
  }

  render() {
    const { selectedComponentIds, getLocalizedText } = this.props;
    
    const {
      linkingProp,
      linkingValueDef,
      linkWindowName,
      editingActions,
    } = this.state;

    if (selectedComponentIds.size === 0) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('propsEditor.noComponentsSelectedText')}
        />
      );
    }

    if (selectedComponentIds.size > 1) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('propsEditor.multipleComponentsSelectedText')}
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

    renderablePropNames.forEach(propName => {
      const propMeta = componentMeta.props[propName];
      if (propMeta.group) propsByGroup.get(propMeta.group).push(propName);
      else propsWithoutGroup.push(propName);
    });

    const content = [];

    propGroups.forEach(group => {
      content.push(
        <BlockContentBoxHeading
          key={`${group.name}__heading__`}
          hidden={editingActions}
          isBordered
        >
          {group.title}
        </BlockContentBoxHeading>,
      );

      const controls = group.props.map(propName => this._renderPropsItem(
        componentMeta,
        propName,
        component.props.get(propName) || null,
      ));

      content.push(
        <BlockContentBoxItem
          key={group.name}
          hidden={editingActions}
        >
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
        <BlockContentBoxItem
          key="__no_group__"
          hidden={editingActions}
        >
          <PropsList>
            {controls}
          </PropsList>
        </BlockContentBoxItem>,
      );
    }
    
    const systemProps = this._renderSystemProps(component);
    const actionsEditor = this._renderActionsEditor();

    return (
      <BlockContentBox isBordered>
        {systemProps}
        {content}
        {actionsEditor}
  
        <DesignDialog
          title="Link attribute value"
          backdrop
          minWidth={420}
          paddingSize="none"
          open={linkingProp}
          haveCloseButton
          onClose={this._handleLinkCancel}
        >
          <LinkPropWindow
            name={linkWindowName}
            valueDef={linkingValueDef}
            userTypedefs={componentMeta.types}
            onLink={this._handleLinkApply}
          />
        </DesignDialog>
      </BlockContentBox>
    );
  }
}

ComponentPropsEditorComponent.propTypes = propTypes;
ComponentPropsEditorComponent.defaultProps = defaultProps;
ComponentPropsEditorComponent.dispalyName = 'ComponentPropsEditor';

export const ComponentPropsEditor = wrap(ComponentPropsEditorComponent);
