import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Shortcuts } from 'react-shortcuts';
import Portal from 'react-portal-minimal';
import { push } from 'react-router-redux';
import { List } from 'immutable';
import { Dialog } from 'reactackle-dialog';
import { Desktop } from '../containers/Desktop/Desktop';
import { DesignToolbar } from '../containers/toolbars';

import {
  CreateComponentMenu,
} from '../containers/CreateComponentMenu/CreateComponentMenu';

import {
  ComponentsLibrary,
} from '../containers/ComponentsLibrary/ComponentsLibrary';

import {
  ComponentsTreeView,
} from '../containers/ComponentsTreeView/ComponentsTreeView';

import {
  ComponentPropsEditor,
} from '../containers/ComponentPropsEditor/ComponentPropsEditor';

import {
  ComponentRegionsEditor,
} from '../containers/ComponentRegionsEditor/ComponentRegionsEditor';

import {
  ComponentActionsEditor,
} from '../containers/ComponentActionsEditor/ComponentActionsEditor';

import {
  ComponentDataSelect,
} from '../containers/ComponentDataSelect/ComponentDataSelect';

import {
  LayoutSelectionDialog,
} from '../containers/LayoutSelectionDialog/LayoutSelectionDialog';

import { Canvas, getComponentCoords } from '../containers/Canvas/Canvas';

import {
  ComponentsDragArea,
} from '../containers/ComponentsDragArea/ComponentsDragArea';

import { AppWrapper } from '../components/AppWrapper/AppWrapper';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';
import Clipboard from '../models/Clipboard';
import Cursor from '../models/Cursor';

import {
  createComponent,
  renameComponent,
  deleteComponent,
  copyComponent,
  moveComponent,
  pickComponentDataDone,
  undo,
  redo,
  moveComponentToClipboard,
  convertComponentToList,
  ComponentPickAreas,
} from '../actions/project';

import { dropComponent } from '../actions/preview';

import {
  toggleInvisibleComponents,
  toggleContentPlaceholders,
} from '../actions/app';

import {
  singleComponentSelectedSelector,
  firstSelectedComponentIdSelector,
  currentComponentsSelector,
  getLocalizedTextFromState,
  containerStyleSelector,
  cursorPositionSelector,
  componentClipboardSelector,
  canDeleteComponentSelector,
} from '../selectors';

import {
  isCompositeComponent,
  componentHasActions,
  constructComponent,
} from '../lib/meta';

import {
  isRootComponent,
  canInsertComponent,
  canMoveComponent,
  formatComponentTitle,
} from '../lib/components';

import {
  TOOL_ID_LIBRARY,
  TOOL_ID_COMPONENTS_TREE,
  TOOL_ID_PROPS_EDITOR,
} from '../constants/tool-ids';

import { isInputOrTextareaActive } from '../utils/dom';
import { buildStructurePath } from '../constants/paths';
import * as JssyPropTypes from '../constants/common-prop-types';
import { INVALID_ID } from '../constants/misc';
import { IconLibrary, IconTree, IconBrush } from '../components/icons';

const propTypes = {
  projectName: PropTypes.string.isRequired, // state
  components: JssyPropTypes.components.isRequired, // state
  meta: PropTypes.object.isRequired, // state
  previewContainerStyle: PropTypes.string.isRequired, // state
  singleComponentSelected: PropTypes.bool.isRequired, // state
  firstSelectedComponentId: PropTypes.number.isRequired, // state
  language: PropTypes.string.isRequired, // state
  pickedComponentId: PropTypes.number.isRequired, // state
  pickedComponentArea: PropTypes.number.isRequired, // state
  componentDataListIsVisible: PropTypes.bool.isRequired, // state
  componentDataListItems: PropTypes.arrayOf(
    JssyPropTypes.componentDataItem,
  ).isRequired, // state
  cursorPosition: PropTypes.instanceOf(Cursor).isRequired, // state
  componentClipboard: PropTypes.instanceOf(Clipboard).isRequired, // state
  showInvisibleComponents: PropTypes.bool.isRequired, // state
  showContentPlaceholders: PropTypes.bool.isRequired, // state
  canDelete: PropTypes.bool.isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onCreateComponent: PropTypes.func.isRequired, // dispatch
  onRenameComponent: PropTypes.func.isRequired, // dispatch
  onDeleteComponent: PropTypes.func.isRequired, // dispatch
  onCopyComponent: PropTypes.func.isRequired, // dispatch
  onMoveComponent: PropTypes.func.isRequired, // dispatch
  onMoveComponentToClipboard: PropTypes.func.isRequired, // dispatch
  onConvertComponentToList: PropTypes.func.isRequired, // dispatch
  onDropComponent: PropTypes.func.isRequired, // dispatch
  onSelectComponentData: PropTypes.func.isRequired, // dispatch
  onUndo: PropTypes.func.isRequired, // dispatch
  onRedo: PropTypes.func.isRequired, // dispatch
  onGoToStructure: PropTypes.func.isRequired, // dispatch
  onToggleInvisibleComponents: PropTypes.func.isRequired, // dispatch
  onToggleContentPlaceholders: PropTypes.func.isRequired, // dispatch
};

const mapStateToProps = state => ({
  projectName: state.project.projectName,
  components: currentComponentsSelector(state),
  meta: state.project.meta,
  previewContainerStyle: containerStyleSelector(state),
  singleComponentSelected: singleComponentSelectedSelector(state),
  firstSelectedComponentId: firstSelectedComponentIdSelector(state),
  language: state.project.languageForComponentProps,
  pickedComponentId: state.project.pickedComponentId,
  pickedComponentArea: state.project.pickedComponentArea,
  componentDataListIsVisible: state.project.componentDataListIsVisible,
  componentDataListItems: state.project.componentDataListItems,
  cursorPosition: cursorPositionSelector(state),
  componentClipboard: componentClipboardSelector(state),
  showInvisibleComponents: state.app.showInvisibleComponents,
  showContentPlaceholders: state.app.showContentPlaceholders,
  canDelete: canDeleteComponentSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onCreateComponent: (components, containerId, afterIdx) =>
    void dispatch(createComponent(components, containerId, afterIdx)),

  onRenameComponent: (componentId, newTitle) =>
    void dispatch(renameComponent(componentId, newTitle)),

  onDeleteComponent: componentId =>
    void dispatch(deleteComponent(componentId)),

  onCopyComponent: (componentId, containerId, afterIdx) =>
    void dispatch(copyComponent(componentId, containerId, afterIdx)),

  onMoveComponent: (componentId, containerId, afterIdx) =>
    void dispatch(moveComponent(componentId, containerId, afterIdx, true)),

  onMoveComponentToClipboard: (componentId, copy) =>
    void dispatch(moveComponentToClipboard(componentId, copy)),

  onConvertComponentToList: componentId =>
    void dispatch(convertComponentToList(componentId)),

  onDropComponent: area =>
    void dispatch(dropComponent(area)),

  onSelectComponentData: ({ data }) =>
    void dispatch(pickComponentDataDone(data)),

  onUndo: () => void dispatch(undo()),
  onRedo: () => void dispatch(redo()),

  onGoToStructure: projectName => {
    const path = buildStructurePath({ projectName });
    dispatch(push(path));
  },

  onToggleInvisibleComponents: enable =>
    void dispatch(toggleInvisibleComponents(enable)),

  onToggleContentPlaceholders: enable =>
    void dispatch(toggleContentPlaceholders(enable)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

const NestedConstructorsBreadcrumbsItem = props => (
  <span className={props.className}>
    {props.children}
  </span>
);

NestedConstructorsBreadcrumbsItem.propTypes = {
  className: PropTypes.string,
};
NestedConstructorsBreadcrumbsItem.defaultProps = {
  className: '',
};

NestedConstructorsBreadcrumbsItem.displayName =
  'NestedConstructorsBreadcrumbsItem';

class DesignRoute extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      createComponentMenuIsVisible: false,
      confirmDeleteComponentDialogIsVisible: false,
    };

    this._handleShortcuts =
      this._handleShortcuts.bind(this);
    this._handleToolTitleChange =
      this._handleToolTitleChange.bind(this);
    this._handleDeleteSelectedComponent =
      this._handleDeleteSelectedComponent.bind(this);
    this._handleDeleteComponentButtonPress =
      this._handleDeleteComponentButtonPress.bind(this);
    this._handleDeleteComponentConfirm =
      this._handleDeleteComponentConfirm.bind(this);
    this._handleDeleteComponentCancel =
      this._handleDeleteComponentCancel.bind(this);
    this._handleDropComponent =
      this._handleDropComponent.bind(this);
    this._handleCreateComponent =
      this._handleCreateComponent.bind(this);
    this._handleCreateComponentMenuClose =
      this._handleCreateComponentMenuClose.bind(this);
    this._handleToggleInvisibleComponents =
      this._handleToggleInvisibleComponents.bind(this);
    this._handleToggleContentPlaceholders =
      this._handleToggleContentPlaceholders.bind(this);
    this._handleDuplicateSelectedComponent =
      this._handleDuplicateSelectedComponent.bind(this);
    this._handleCopySelectedComponent =
      this._handleMoveSelectedComponentToClipboard.bind(this, true);
    this._handleCutSelectedComponent =
      this._handleMoveSelectedComponentToClipboard.bind(this, false);
    this._handlePasteComponent =
      this._handlePasteComponent.bind(this);
    this._handleConvertComponentToList =
      this._handleConvertComponentToList.bind(this);
  }

  _getLibraryTool() {
    const { getLocalizedText } = this.props;

    return new ToolRecord({
      id: TOOL_ID_LIBRARY,
      icon: <IconLibrary />,
      name: getLocalizedText('design.tool.componentsLibrary'),
      title: getLocalizedText('design.tool.componentsLibrary'),
      sections: List([
        new ToolSectionRecord({
          name: '',
          component: ComponentsLibrary,
        }),
      ]),
      windowMinWidth: 360,
    });
  }

  _getTreeTool() {
    const { getLocalizedText } = this.props;

    return new ToolRecord({
      id: TOOL_ID_COMPONENTS_TREE,
      icon: <IconTree />,
      name: getLocalizedText('design.tool.elementsTree'),
      title: getLocalizedText('design.tool.elementsTree'),
      sections: List([
        new ToolSectionRecord({
          name: '',
          component: ComponentsTreeView,
        }),
      ]),
    });
  }

  _getPropsEditorTool() {
    const {
      meta,
      components,
      singleComponentSelected,
      firstSelectedComponentId,
      getLocalizedText,
    } = this.props;

    const propsEditorSection = new ToolSectionRecord({
      name: 'General',
      component: ComponentPropsEditor,
    });

    let title = '';
    let subtitle = '';
    let sections = List([propsEditorSection]);

    if (singleComponentSelected) {
      const selectedComponent = components.get(firstSelectedComponentId);

      title = selectedComponent.title;
      subtitle = selectedComponent.name;

      if (isCompositeComponent(selectedComponent.name, meta)) {
        sections = sections.push(
          new ToolSectionRecord({
            name: 'Regions',
            component: ComponentRegionsEditor,
          }),
        );
      }

      if (componentHasActions(selectedComponent.name, meta)) {
        sections = sections.push(
          new ToolSectionRecord({
            name: 'Actions',
            component: ComponentActionsEditor,
          }),
        );
      }
    } else {
      title = getLocalizedText('design.tool.componentConfiguration');
    }

    const name = getLocalizedText('design.tool.componentConfiguration');
    const titlePlaceholder =
      getLocalizedText('design.tool.componentConfiguration.enterTitle');

    return new ToolRecord({
      id: TOOL_ID_PROPS_EDITOR,
      icon: <IconBrush />,
      name,
      title,
      titleEditable: singleComponentSelected,
      titlePlaceholder,
      subtitle,
      sections,
    });
  }

  _getTools() {
    const libraryTool = this._getLibraryTool();
    const treeTool = this._getTreeTool();
    const propsEditorTool = this._getPropsEditorTool();
    return List([List([libraryTool, treeTool, propsEditorTool])]);
  }

  /**
   *
   * @param {string} action
   * @private
   */
  _handleShortcuts(action) {
    switch (action) {
      case 'UNDO': this.props.onUndo(); break;
      case 'REDO': this.props.onRedo(); break;

      case 'DELETE_COMPONENT': {
        if (!isInputOrTextareaActive()) {
          this._handleDeleteSelectedComponent();
        }
        break;
      }

      case 'DUPLICATE_COMPONENT': {
        this._handleDuplicateSelectedComponent();
        break;
      }

      case 'COPY_COMPONENT': {
        this._handleMoveSelectedComponentToClipboard(true);
        break;
      }

      case 'CUT_COMPONENT': {
        this._handleMoveSelectedComponentToClipboard(false);
        break;
      }

      case 'PASTE_COMPONENT': {
        this._handlePasteComponent();
        break;
      }

      case 'GO_TO_STRUCTURE': {
        const { projectName, onGoToStructure } = this.props;

        onGoToStructure(projectName);
        break;
      }

      case 'OPEN_CREATE_COMPONENT_MENU': {
        const { components, cursorPosition } = this.props;

        const willOpenMenu =
          cursorPosition.containerId !== INVALID_ID ||
          components.size === 0;

        if (willOpenMenu) {
          this.setState({
            createComponentMenuIsVisible: true,
          });
        }

        break;
      }

      default:
    }
  }

  /**
   *
   * @private
   */
  _handleDeleteSelectedComponent() {
    const { canDelete } = this.props;

    if (canDelete) {
      this._handleDeleteComponentButtonPress();
    }
  }

  /**
   *
   * @private
   */
  _handleDuplicateSelectedComponent() {
    const {
      meta,
      components,
      singleComponentSelected,
      firstSelectedComponentId,
      onCopyComponent,
    } = this.props;

    if (!singleComponentSelected) return;

    const selectedComponent = components.get(firstSelectedComponentId);

    if (isRootComponent(selectedComponent)) return;

    const parentComponent = components.get(selectedComponent.parentId);
    const afterIdx = parentComponent.children.indexOf(selectedComponent.id) + 1;
    const canDuplicate = canInsertComponent(
      selectedComponent.name,
      components,
      parentComponent.id,
      afterIdx,
      meta,
    );

    if (canDuplicate) {
      onCopyComponent(
        selectedComponent.id,
        selectedComponent.parentId,
        afterIdx - 1, // copyComponent receives afterIdx instead of position
      );
    }
  }

  /**
   *
   * @param {boolean} copy
   * @private
   */
  _handleMoveSelectedComponentToClipboard(copy) {
    const {
      components,
      singleComponentSelected,
      firstSelectedComponentId,
      onMoveComponentToClipboard,
    } = this.props;

    if (!singleComponentSelected) return;

    const selectedComponent = components.get(firstSelectedComponentId);

    if (isRootComponent(selectedComponent)) return;

    onMoveComponentToClipboard(selectedComponent.id, copy);
  }

  /**
   *
   * @private
   */
  _handlePasteComponent() {
    const {
      meta,
      components,
      componentClipboard,
      cursorPosition,
      onCopyComponent,
      onMoveComponent,
    } = this.props;

    if (componentClipboard.componentId === INVALID_ID) return;

    const clipboardComponent = components.get(componentClipboard.componentId);

    if (componentClipboard.copy) {
      const canCopy = canInsertComponent(
        clipboardComponent.name,
        components,
        cursorPosition.containerId,
        cursorPosition.afterIdx,
        meta,
      );

      if (canCopy) {
        onCopyComponent(
          componentClipboard.componentId,
          cursorPosition.containerId,
          cursorPosition.afterIdx,
        );
      }
    } else {
      const canMove = canMoveComponent(
        components,
        componentClipboard.componentId,
        cursorPosition.containerId,
        cursorPosition.afterIdx,
        meta,
      );

      if (canMove) {
        onMoveComponent(
          componentClipboard.componentId,
          cursorPosition.containerId,
          cursorPosition.afterIdx,
        );
      }
    }
  }

  /**
   *
   * @param {Object} tool
   * @param {string} newTitle
   * @private
   */
  _handleToolTitleChange(tool, newTitle) {
    const { firstSelectedComponentId, onRenameComponent } = this.props;

    if (tool.id === TOOL_ID_PROPS_EDITOR) {
      onRenameComponent(firstSelectedComponentId, newTitle);
    }
  }

  /**
   *
   * @private
   */
  _handleDeleteComponentButtonPress() {
    this.setState({
      confirmDeleteComponentDialogIsVisible: true,
    });
  }

  /**
   *
   * @private
   */
  _handleDeleteComponentConfirm() {
    const { firstSelectedComponentId, onDeleteComponent } = this.props;

    this.setState({
      confirmDeleteComponentDialogIsVisible: false,
    }, () => {
      onDeleteComponent(firstSelectedComponentId);
    });
  }

  /**
   *
   * @private
   */
  _handleDeleteComponentCancel() {
    this.setState({
      confirmDeleteComponentDialogIsVisible: false,
    });
  }

  /**
   *
   * @private
   */
  _handleDropComponent({ dropZoneId }) {
    const { onDropComponent } = this.props;
    onDropComponent(dropZoneId);
  }

  /**
   *
   * @param {string} componentName
   * @private
   */
  _handleCreateComponent({ componentName }) {
    const { meta, language, cursorPosition, onCreateComponent } = this.props;

    this.setState({
      createComponentMenuIsVisible: false,
    });

    const components = constructComponent(componentName, 0, language, meta);

    onCreateComponent(
      components,
      cursorPosition.containerId,
      cursorPosition.afterIdx,
    );
  }

  /**
   *
   * @private
   */
  _handleCreateComponentMenuClose() {
    this.setState({
      createComponentMenuIsVisible: false,
    });
  }

  /**
   *
   * @private
   */
  _handleToggleInvisibleComponents() {
    const { showInvisibleComponents, onToggleInvisibleComponents } = this.props;
    onToggleInvisibleComponents(!showInvisibleComponents);
  }

  /**
   *
   * @private
   */
  _handleToggleContentPlaceholders() {
    const { showContentPlaceholders, onToggleContentPlaceholders } = this.props;
    onToggleContentPlaceholders(!showContentPlaceholders);
  }

  /**
   *
   * @private
   */
  _handleConvertComponentToList() {
    const {
      singleComponentSelected,
      firstSelectedComponentId,
      onConvertComponentToList,
    } = this.props;

    if (singleComponentSelected) {
      onConvertComponentToList(firstSelectedComponentId);
    }
  }

  _renderComponentDataSelect() {
    const {
      pickedComponentId,
      componentDataListItems,
      getLocalizedText,
      onSelectComponentData,
    } = this.props;

    const componentElementCoords = getComponentCoords(pickedComponentId);
    if (!componentElementCoords) return null;

    const wrapperStyle = {
      position: 'absolute',
      zIndex: '1000',
      left: `${componentElementCoords.x}px`,
      top: `${componentElementCoords.y}px`,
    };

    return (
      <Portal>
        <div style={wrapperStyle}>
          <ComponentDataSelect
            componentDataItems={componentDataListItems}
            getLocalizedText={getLocalizedText}
            onSelect={onSelectComponentData}
          />
        </div>
      </Portal>
    );
  }

  _renderCreateComponentMenu() {
    return (
      <Portal>
        <CreateComponentMenu
          onCreateComponent={this._handleCreateComponent}
          onClose={this._handleCreateComponentMenuClose}
        />
      </Portal>
    );
  }

  render() {
    const {
      projectName,
      previewContainerStyle,
      components,
      firstSelectedComponentId,
      componentDataListIsVisible,
      pickedComponentArea,
      getLocalizedText,
      onUndo,
      onRedo,
    } = this.props;

    const {
      createComponentMenuIsVisible,
      confirmDeleteComponentDialogIsVisible,
    } = this.state;

    const confirmDeleteDialogButtons = [{
      text: getLocalizedText('common.delete'),
      onPress: this._handleDeleteComponentConfirm,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleDeleteComponentCancel,
    }];

    const toolGroups = this._getTools();

    let deleteComponentDialogText = '';
    if (confirmDeleteComponentDialogIsVisible) {
      const selectedComponent = components.get(firstSelectedComponentId);
      const componentTitle = formatComponentTitle(selectedComponent);

      deleteComponentDialogText = getLocalizedText(
        'design.deleteComponentQuestion',
        { title: componentTitle },
      );
    }

    const willRenderComponentDataSelect =
      componentDataListIsVisible &&
      pickedComponentArea === ComponentPickAreas.CANVAS;

    const componentDataSelect = willRenderComponentDataSelect
      ? this._renderComponentDataSelect()
      : null;

    const createComponentMenu = createComponentMenuIsVisible
      ? this._renderCreateComponentMenu()
      : null;

    return (
      <Shortcuts
        name="DESIGN_SCREEN"
        handler={this._handleShortcuts} // eslint-disable-line react/jsx-handler-names
        targetNodeSelector="body"
        className="jssy-app"
      >
        <Desktop
          toolGroups={toolGroups}
          onToolTitleChange={this._handleToolTitleChange}
        >
          <DesignToolbar
            onDuplicate={this._handleDuplicateSelectedComponent}
            onCopy={this._handleCopySelectedComponent}
            onCut={this._handleCutSelectedComponent}
            onPaste={this._handlePasteComponent}
            onDelete={this._handleDeleteComponentButtonPress}
            onUndo={onUndo}
            onRedo={onRedo}
            onConvertToList={this._handleConvertComponentToList}
            onToggleInvisible={this._handleToggleInvisibleComponents}
            onTogglePlaceholders={this._handleToggleContentPlaceholders}
          />

          <AppWrapper>
            <Canvas
              projectName={projectName}
              containerStyle={previewContainerStyle}
            />
          </AppWrapper>

          <LayoutSelectionDialog />

          <Dialog
            title={getLocalizedText('design.deleteComponent')}
            backdrop
            minWidth={400}
            buttons={confirmDeleteDialogButtons}
            open={confirmDeleteComponentDialogIsVisible}
            closeOnEscape
            closeOnBackdropClick
            onClose={this._handleDeleteComponentCancel}
            onEnterKeyPress={this._handleDeleteComponentConfirm}
          >
            {deleteComponentDialogText}
          </Dialog>

          <ComponentsDragArea onDrop={this._handleDropComponent} />
          {componentDataSelect}
          {createComponentMenu}
        </Desktop>
      </Shortcuts>
    );
  }
}

DesignRoute.propTypes = propTypes;
DesignRoute.displayName = 'DesignRoute';

export default wrap(DesignRoute);
