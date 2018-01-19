import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce';
import { Button } from 'reactackle-button';
import { getNestedTypedef } from '@jssy/types';

import {
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentPlaceholder,
} from '../../components/BlockContent';

import { PropsList } from '../../components/PropsList/PropsList';
import { PropsAccordion } from '../../components/PropsAccordion/PropsAccordion';
import { DesignDialog } from '../DesignDialog/DesignDialog';
import { JssyValueEditor } from '../JssyValueEditor/JssyValueEditor';
import { ActionEditor } from '../ActionEditor/ActionEditor';
import { ActionsList } from '../ActionsList/ActionsList';
import { LinkPropWindow } from '../LinkPropWindow/LinkPropWindow';
import { PropCodeEditor } from '../../components/props';

import {
  replaceJssyValue,
  constructComponentForProp,
  addAction,
  replaceAction,
  deleteAction,
  changeComponentStyle,
} from '../../actions/project';

import { PathStartingPoints } from '../../reducers/project';

import {
  singleSelectedComponentSelector,
  selectedComponentsNumberSelector,
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
  isHTMLComponent,
} from '../../lib/meta';

import ProjectComponent from '../../models/ProjectComponent';
import { INVALID_ID, SYSTEM_PROPS } from '../../constants/misc';
import { CSS_EDITOR_DEBOUNCE } from '../../config';

/**
 * @typedef {Object} PropsGroup
 * @property {string} name
 * @property {string} title
 * @property {Array<string>} props
 */

const propTypes = {
  meta: PropTypes.object.isRequired, // state
  selectedComponent: PropTypes.instanceOf(ProjectComponent), // state
  selectedComponentsNumber: PropTypes.number.isRequired, // state
  language: PropTypes.string.isRequired, // state
  ownerProps: PropTypes.object, // state
  ownerUserTypedefs: PropTypes.object, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onReplacePropValue: PropTypes.func.isRequired, // dispatch
  onConstructComponent: PropTypes.func.isRequired, // dispatch
  onAddAction: PropTypes.func.isRequired, // dispatch
  onReplaceAction: PropTypes.func.isRequired, // dispatch
  onDeleteAction: PropTypes.func.isRequired, // dispatch
  onChangeComponentStyle: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {
  selectedComponent: null,
  ownerProps: null,
  ownerUserTypedefs: null,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  selectedComponent: singleSelectedComponentSelector(state),
  selectedComponentsNumber: selectedComponentsNumberSelector(state),
  language: state.app.language,
  ownerProps: ownerPropsSelector(state),
  ownerUserTypedefs: ownerUserTypedefsSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onReplacePropValue: (path, newValue) =>
    void dispatch(replaceJssyValue(path, newValue)),

  onConstructComponent: (path, components, rootId) =>
    void dispatch(constructComponentForProp(path, components, rootId)),

  onAddAction: ({ path, action }) =>
    void dispatch(addAction(path, action)),

  onReplaceAction: ({ path, index, newAction }) =>
    void dispatch(replaceAction(path, index, newAction)),

  onDeleteAction: ({ path, index }) =>
    void dispatch(deleteAction(path, index)),

  onChangeComponentStyle: ({ style, componentId }) =>
    void dispatch(changeComponentStyle(componentId, style)),
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

const getStyle = component => component !== null ? component.style : '';

class ComponentPropsEditorComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      componentStyle: getStyle(props.selectedComponent),
      linkingProp: false,
      linkingPath: null,
      linkingValueDef: null,
      linkWindowName: '',
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

    this._handleSetComponent = this._handleSetComponent.bind(this, false);
    this._handleEditActions = this._handleEditActions.bind(this, false);
    this._handleChange = this._handleChange.bind(this, false);
    this._handleLink = this._handleLink.bind(this, false);

    this._handleLinkApply = this._handleLinkApply.bind(this);
    this._handleLinkCancel = this._handleLinkCancel.bind(this);
    this._handleCreateAction = this._handleCreateAction.bind(this);
    this._handleEditAction = this._handleEditAction.bind(this);
    this._handleDeleteAction = this._handleDeleteAction.bind(this);
    this._handleActionEditorSave = this._handleActionEditorSave.bind(this);
    this._handleActionEditorCancel = this._handleActionEditorCancel.bind(this);
    this._handleCloseActionsEditor = this._handleCloseActionsEditor.bind(this);
    this._handleStyleChange = this._handleStyleChange.bind(this);

    this._saveComponentStyle = debounce(
      this._saveComponentStyle.bind(this),
      CSS_EDITOR_DEBOUNCE,
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedComponent !== this.props.selectedComponent) {
      this.setState({
        componentStyle: getStyle(nextProps.selectedComponent),
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
    const { selectedComponent, onReplacePropValue } = this.props;

    const fullPath = buildFullPath(selectedComponent.id, isSystemProp, name);
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
    const { meta, selectedComponent } = this.props;

    let linkingValueDef;
    if (isSystemProp) {
      const propMeta = SYSTEM_PROPS[name];
      linkingValueDef = getNestedTypedef(propMeta, path);
    } else {
      const componentMeta = getComponentMeta(selectedComponent.name, meta);
      const propMeta = componentMeta.props[name];
      linkingValueDef = getNestedTypedef(propMeta, path, componentMeta.types);
    }

    this.setState({
      linkingProp: true,
      linkingPath: buildFullPath(
        selectedComponent.id,
        isSystemProp,
        name,
        path,
      ),
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
      selectedComponent,
      language,
      onConstructComponent,
    } = this.props;

    const currentPropValue = isSystemProp
      ? selectedComponent.systemProps.get(name)
      : selectedComponent.props.get(name);

    const currentValue = currentPropValue.getInStatic(path);
    const componentMeta = getComponentMeta(selectedComponent.name, meta);
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
      const { namespace } = parseComponentName(selectedComponent.name);
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

    const fullPath = buildFullPath(
      selectedComponent.id,
      isSystemProp,
      name,
      path,
    );

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
    const { selectedComponent, onDeleteAction } = this.props;

    const {
      editingActionsForProp,
      editingActionsForSystemProp,
      editingActionsForPath,
    } = this.state;

    const pathToList = actionPath.slice(0, -1);
    const index = actionPath[actionPath.length - 1];
    const path = buildFullPathToActionsList(
      selectedComponent.id,
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
    const { selectedComponent, onAddAction, onReplaceAction } = this.props;

    const {
      actionEditorView,
      editingActionsForProp,
      editingActionsForSystemProp,
      editingActionsForPath,
      actionPath,
      pathToActionsList,
    } = this.state;

    if (actionEditorView === ActionEditorViews.NEW) {
      const path = buildFullPathToActionsList(
        selectedComponent.id,
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
        selectedComponent.id,
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

  _saveComponentStyle() {
    const { selectedComponent, onChangeComponentStyle } = this.props;
    const { componentStyle } = this.state;

    onChangeComponentStyle({
      componentId: selectedComponent.id,
      style: componentStyle,
    });
  }

  _handleStyleChange(newStyle) {
    this.setState({
      componentStyle: newStyle,
    });

    this._saveComponentStyle();
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
    const { selectedComponent, getLocalizedText } = this.props;

    const {
      editingActions,
      editingActionsForProp,
      editingActionsForSystemProp,
      editingActionsForPath,
      actionEditorView,
      actionPath,
    } = this.state;

    if (!editingActions) {
      return null;
    }

    const propValue = editingActionsForSystemProp
      ? selectedComponent.systemProps.get(editingActionsForProp)
      : selectedComponent.props.get(editingActionsForProp);

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

  /**
   *
   * @param {PropsGroup} group
   * @return {{id: string, title: string, content: ReactElement}}
   * @private
   */
  _createAccordionItem(group) {
    const { meta, selectedComponent } = this.props;
    const { editingActions } = this.state;

    const { name, title, props } = group;
    const componentMeta = getComponentMeta(selectedComponent.name, meta);
    const controls = props.map(propName => this._renderPropsItem(
      componentMeta,
      propName,
      selectedComponent.props.get(propName) || null,
    ));

    const content = (
      <BlockContentBoxItem key={name} hidden={editingActions}>
        <PropsList>
          {controls}
        </PropsList>
      </BlockContentBoxItem>
    );

    return { id: name, title, content };
  }

  /**
   *
   * @return {?ReactElement}
   * @private
   */
  _renderStyleEditor() {
    const { selectedComponent } = this.props;
    const { componentStyle } = this.state;

    if (!isHTMLComponent(selectedComponent.name)) {
      return null;
    }

    return (
      <BlockContentBoxItem>
        <PropCodeEditor
          value={componentStyle}
          mode="css"
          label="CSS"
          onChange={this._handleStyleChange}
        />
      </BlockContentBoxItem>
    );
  }

  render() {
    const {
      selectedComponent,
      selectedComponentsNumber,
      meta,
      language,
      getLocalizedText,
    } = this.props;

    const { linkingProp, linkingValueDef, linkWindowName } = this.state;

    if (selectedComponentsNumber === 0) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('propsEditor.noComponentsSelectedText')}
        />
      );
    }

    if (selectedComponentsNumber > 1) {
      return (
        <BlockContentPlaceholder
          text={getLocalizedText('propsEditor.multipleComponentsSelectedText')}
        />
      );
    }

    const componentMeta = getComponentMeta(selectedComponent.name, meta);
    if (!componentMeta) {
      return null;
    }

    const propGroups = componentMeta.propGroups.map(groupData => ({
      name: groupData.name,
      title: getString(
        componentMeta.strings,
        groupData.textKey,
        language,
      ),
      props: [],
    }));

    const propsByGroup = new Map();
    propGroups.forEach(group => {
      propsByGroup.set(group.name, group.props);
    });

    const propsWithoutGroup = [];
    const renderablePropNames = Object.keys(componentMeta.props)
      .filter(propName => isRenderableProp(componentMeta.props[propName]));

    renderablePropNames.forEach(propName => {
      const propMeta = componentMeta.props[propName];
      if (propMeta.group) propsByGroup.get(propMeta.group).push(propName);
      else propsWithoutGroup.push(propName);
    });

    const accordionItems = [];

    propGroups.forEach(group => {
      const groupDescription = this._createAccordionItem(group);
      accordionItems.push(groupDescription);
    });

    if (propsWithoutGroup.length > 0) {
      const defaultGroup = {
        name: '__no_group__',
        title: getLocalizedText('propsEditor.propsWithoutGroup.name'),
        props: propsWithoutGroup,
      };

      const groupDescription = this._createAccordionItem(defaultGroup);
      accordionItems.push(groupDescription);
    }

    const systemProps = this._renderSystemProps(selectedComponent);
    const actionsEditor = this._renderActionsEditor();
    const styleEditor = this._renderStyleEditor();

    return (
      <BlockContentBox isBordered>
        {systemProps}
        {styleEditor}
        <PropsAccordion items={accordionItems} />
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
