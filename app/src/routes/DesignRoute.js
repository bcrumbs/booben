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

import { RouteEditor } from '../containers/RouteEditor/RouteEditor';
import { RouteTreeView } from '../containers/RouteTree/RouteTree';

import { AppWrapper } from '../components/AppWrapper/AppWrapper';
import ToolRecord from '../models/Tool';
import ButtonRecord from '../models/Button';
import ProjectRecord from '../models/Project';
import ToolSectionRecord from '../models/ToolSection';
import Clipboard from '../models/Clipboard';
import Cursor from '../models/Cursor';

import {
  createRoute,
  createComponent,
  renameComponent,
  deleteComponent,
  updateRoutePath,
  updateRouteField,
  copyComponent,
  deleteRoute,
  moveComponent,
  pickComponentDataDone,
  undo,
  redo,
  moveComponentToClipboard,
  convertComponentToList,
  ComponentPickAreas,
} from '../actions/project';

import { dropComponent } from '../actions/preview';

import { selectRoute } from '../actions/structure';

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

import {
  buildStructurePath,
  buildDesignRoutePath,
  buildDesignRouteIndexPath,
} from '../constants/paths';

import * as BoobenPropTypes from '../constants/common-prop-types';
import { INVALID_ID } from '../constants/misc';
import { IconLibrary, IconTree, IconBrush } from '../components/icons';

import {
  RouteContentViewButton,
} from '../containers/RouteTree/RouteContentViewButton';

import { RoutesListHeader } from '../containers/RouteTree/RoutesListHeader';

import {
  CreateRouteDialog,
  EditRoutePathDialog,
} from '../containers/route-dialogs';

const propTypes = {
  project: PropTypes.instanceOf(ProjectRecord).isRequired, // store
  projectName: PropTypes.string.isRequired, // state
  components: BoobenPropTypes.components.isRequired, // state
  meta: PropTypes.object.isRequired, // state
  selectedRouteId: PropTypes.number.isRequired, // store
  previewContainerStyle: PropTypes.string.isRequired, // state
  singleComponentSelected: PropTypes.bool.isRequired, // state
  firstSelectedComponentId: PropTypes.number.isRequired, // state
  language: PropTypes.string.isRequired, // state
  pickedComponentId: PropTypes.number.isRequired, // state
  pickedComponentArea: PropTypes.number.isRequired, // state
  componentDataListIsVisible: PropTypes.bool.isRequired, // state
  indexRouteSelected: PropTypes.bool.isRequired,
  propsViewMode: PropTypes.oneOf(['componentProps', 'routeProps']).isRequired,
  treeViewMode: PropTypes.oneOf(['routesList', 'routeTree']).isRequired,
  componentDataListItems: PropTypes.arrayOf(BoobenPropTypes.componentDataItem)
    .isRequired, // state
  cursorPosition: PropTypes.instanceOf(Cursor).isRequired, // state
  componentClipboard: PropTypes.instanceOf(Clipboard).isRequired, // state
  showInvisibleComponents: PropTypes.bool.isRequired, // state
  showContentPlaceholders: PropTypes.bool.isRequired, // state
  canDelete: PropTypes.bool.isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onSelectRoute: PropTypes.func.isRequired, // dispatch
  onOpenDesigner: PropTypes.func.isRequired, // dispatch
  onRenameRoute: PropTypes.func.isRequired, // dispatch
  onDeleteRoute: PropTypes.func.isRequired, // dispatch
  onCreateRoute: PropTypes.func.isRequired, // dispatch
  onUpdateRoutePath: PropTypes.func.isRequired, // dispatch
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
  project: state.project.data,
  selectedRouteId: state.project.selectedRouteId,
  indexRouteSelected: state.project.indexRouteSelected,
  projectName: state.project.projectName,
  treeViewMode: state.desktop.treeViewMode,
  components: currentComponentsSelector(state),
  meta: state.project.meta,
  propsViewMode: state.project.propsViewMode,
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
  onOpenDesigner: ({ projectName, routeId, isIndexRoute }) => {
    const path = isIndexRoute
      ? buildDesignRouteIndexPath({ projectName, routeId })
      : buildDesignRoutePath({ projectName, routeId });

    dispatch(push(path));
  },

  onSelectRoute: (routeId, indexRouteSelected) =>
    void dispatch(selectRoute(routeId, indexRouteSelected)),

  onDeleteRoute: routeId => void dispatch(deleteRoute(routeId)),

  onUpdateRoutePath: (routeId, newPath, newParamValues, renamedParams) =>
    void dispatch(
      updateRoutePath(routeId, newPath, newParamValues, renamedParams),
    ),

  onRenameRoute: (routeId, newTitle) =>
    void dispatch(updateRouteField(routeId, 'title', newTitle)),

  onCreateRoute: (parentRouteId, path, title, paramValues) =>
    void dispatch(createRoute(parentRouteId, path, title, paramValues)),

  onCreateComponent: (components, containerId, afterIdx) =>
    void dispatch(createComponent(components, containerId, afterIdx)),

  onRenameComponent: (componentId, newTitle) =>
    void dispatch(renameComponent(componentId, newTitle)),

  onDeleteComponent: componentId => void dispatch(deleteComponent(componentId)),

  onCopyComponent: (componentId, containerId, afterIdx) =>
    void dispatch(copyComponent(componentId, containerId, afterIdx)),

  onMoveComponent: (componentId, containerId, afterIdx) =>
    void dispatch(moveComponent(componentId, containerId, afterIdx, true)),

  onMoveComponentToClipboard: (componentId, copy) =>
    void dispatch(moveComponentToClipboard(componentId, copy)),

  onConvertComponentToList: componentId =>
    void dispatch(convertComponentToList(componentId)),

  onDropComponent: area => void dispatch(dropComponent(area)),

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

const wrap = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const NestedConstructorsBreadcrumbsItem = props => (
  <span className={props.className}>{props.children}</span>
);

NestedConstructorsBreadcrumbsItem.propTypes = {
  className: PropTypes.string,
};
NestedConstructorsBreadcrumbsItem.defaultProps = {
  className: '',
};

NestedConstructorsBreadcrumbsItem.displayName =
  'NestedConstructorsBreadcrumbsItem';

const normalizePath = (rawPath, isRootRoute) =>
  isRootRoute ? `/${rawPath}` : rawPath;

class DesignRoute extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      createComponentMenuIsVisible: false,
      confirmDeleteComponentDialogIsVisible: false,
      confirmDeleteDialogIsVisible: false,
      createRouteDialogIsVisible: false,
      createRouteParentId: -1,
      editRoutePathDialogIsVisible: false,
      editingRouteId: INVALID_ID,
      newRoutePath: '',
      newRouteTitle: '',
      newRouteParamValues: {},
      pathPatternError: false,
    };

    this._handleDeleteRouteCancel = this._handleDeleteRouteCancel.bind(this);
    this._handleDeleteRouteConfirm = this._handleDeleteRouteConfirm.bind(this);
    this._handleDeleteRouteDialogClose =
      this._handleDeleteRouteDialogClose.bind(this);

    this._handleDeleteRoutePress = this._handleDeleteRoutePress.bind(this);
    this._handleToolRouteTitleChange = this._handleToolRouteTitleChange.bind(
      this,
    );
    this._handleNewRoutePress = this._handleNewRoutePress.bind(this);
    this._handleCreateRouteDialogSubmit =
      this._handleCreateRouteDialogSubmit.bind(this);

    this._handleCreateRouteDialogClose =
    this._handleCreateRouteDialogClose.bind(this);

    this._renderNewRouteDialog = this._renderNewRouteDialog.bind(this);
    this._handleEditPath = this._handleEditPath.bind(this);
    this._handleEditPathDialogSubmit = this._handleEditPathDialogSubmit.bind(
      this,
    );
    this._handleEditPathDialogClose = this._handleEditPathDialogClose.bind(
      this,
    );
    this._handleShortcuts = this._handleShortcuts.bind(this);
    this._handleToolTitleChange = this._handleToolTitleChange.bind(this);
    this._handleDeleteSelectedComponent =
      this._handleDeleteSelectedComponent.bind(this);

    this._handleDeleteComponentButtonPress =
      this._handleDeleteComponentButtonPress.bind(this);

    this._handleDeleteComponentConfirm =
      this._handleDeleteComponentConfirm.bind(this);

    this._handleDeleteComponentCancel = this._handleDeleteComponentCancel.bind(
      this,
    );
    this._handleDropComponent = this._handleDropComponent.bind(this);
    this._handleCreateComponent = this._handleCreateComponent.bind(this);
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

    this._handlePasteComponent = this._handlePasteComponent.bind(this);
    this._handleConvertComponentToList =
      this._handleConvertComponentToList.bind(this);
  }

  _handleToolRouteTitleChange(tool, newTitle) {
    if (tool.id === TOOL_ID_PROPS_EDITOR) {
      this.props.onRenameRoute(this.props.selectedRouteId, newTitle);
    }
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

  _handleDeleteRoutePress() {
    this.setState({ confirmDeleteDialogIsVisible: true });
  }

  _handleDeleteRouteDialogClose() {
    this.setState({ confirmDeleteDialogIsVisible: false });
  }

  _handleDeleteRouteConfirm(closeDialog) {
    const {
      project,
      projectName,
      onSelectRoute,
      onOpenDesigner,
      onDeleteRoute,
    } = this.props;

    const rootRouteId = project.rootRoutes.first();
    const rootRoute = project.routes.get(rootRouteId);

    onSelectRoute(rootRouteId, rootRoute.haveIndex);

    onOpenDesigner({
      projectName,
      routeId: rootRouteId,
      isIndexRoute: rootRoute.haveIndex,
    });

    onDeleteRoute(this.props.selectedRouteId);

    closeDialog();
  }

  _handleDeleteRouteCancel(closeDialog) {
    closeDialog();
  }

  _handleNewRoutePress({ parentRoute }) {
    const parentId = parentRoute ? parentRoute.id : -1;

    this.setState({
      createRouteDialogIsVisible: true,
      createRouteParentId: parentId,
      newRoutePath: '',
      newRouteTitle: '',
      newRouteParamValues: {},
    });
  }

  _handleCreateRouteDialogClose() {
    this.setState({
      createRouteDialogIsVisible: false,
      createRouteParentId: INVALID_ID,
    });
  }

  _renderNewRouteDialog() {
    const { createRouteParentId, createRouteDialogIsVisible } = this.state;

    if (!createRouteDialogIsVisible) return null;

    return (
      <CreateRouteDialog
        open
        parentRouteId={createRouteParentId}
        onSubmit={this._handleCreateRouteDialogSubmit}
        onClose={this._handleCreateRouteDialogClose}
      />
    );
  }

  _renderEditRoutePathDialog() {
    const { editRoutePathDialogIsVisible, editingRouteId } = this.state;

    if (!editRoutePathDialogIsVisible) return null;

    return (
      <EditRoutePathDialog
        open
        editingRouteId={editingRouteId}
        onSubmit={this._handleEditPathDialogSubmit}
        onClose={this._handleEditPathDialogClose}
      />
    );
  }

  _handleCreateRouteDialogSubmit(data) {
    const { onCreateRoute } = this.props;
    const {
      createRouteParentId,
      newRoutePath,
      newRouteTitle,
      newRouteParamValues,
    } = data;

    const isRootRoute = createRouteParentId === -1;
    const title = newRouteTitle.trim();
    const path = normalizePath(newRoutePath, isRootRoute);

    onCreateRoute(createRouteParentId, path, title, newRouteParamValues);
  }

  _handleEditPath() {
    const { project, selectedRouteId } = this.props;

    const route = project.routes.get(selectedRouteId);
    const isRootRoute = route.parentId === INVALID_ID;

    // Remove leading / from root route path
    const displayPath = isRootRoute ? route.path.slice(1) : route.path;

    this.setState(
      {
        editRoutePathDialogIsVisible: true,
        editingRouteId: selectedRouteId,
        newRoutePath: displayPath,
        newRouteParamValues: route.paramValues.toObject(),
      },
      () => {
        if (this._routePathInput) this._routePathInput.focus();
      },
    );
  }

  _handleEditPathDialogSubmit(data) {
    const { project, onUpdateRoutePath } = this.props;

    const { editingRouteId, newRoutePath, newRouteParamValues } = data;

    const route = project.routes.get(editingRouteId);
    const isRootRoute = route.parentId === INVALID_ID;
    const path = normalizePath(newRoutePath, isRootRoute);

    onUpdateRoutePath(editingRouteId, path, newRouteParamValues, {});
  }

  _handleEditPathDialogClose() {
    this.setState({
      editRoutePathDialogIsVisible: false,
      editingRouteId: INVALID_ID,
    });
  }

  _getTreeTool() {
    const { getLocalizedText, treeViewMode } = this.props;

    let component = null;

    if (treeViewMode === 'routesList') {
      component = (
        <RoutesListHeader
          addButtonAction={() =>
            this._handleNewRoutePress({ parentRoute: null })
          }
        />
      );
    } else if (treeViewMode === 'routeTree') {
      component = <RouteContentViewButton />;
    }

    const routesTreeToolSections = List([
      new ToolSectionRecord({
        name: '',
        component: RouteTreeView,
      }),
    ]);

    const componentTreeToolSections = List([
      new ToolSectionRecord({
        name: '',
        component: ComponentsTreeView,
      }),
    ]);

    const activeSections =
      treeViewMode === 'routesList'
        ? routesTreeToolSections
        : componentTreeToolSections;

    return new ToolRecord({
      id: TOOL_ID_COMPONENTS_TREE,
      icon: <IconTree />,
      name: getLocalizedText('design.tool.elementsTree'),
      title: getLocalizedText('design.tool.elementsTree'),
      component,
      sections: activeSections,
    });
  }

  _getRouteEditorTool() {
    const {
      project,
      selectedRouteId,
      indexRouteSelected,
      getLocalizedText,
    } = this.props;
    const selectedRoute =
      selectedRouteId !== -1 ? project.routes.get(selectedRouteId) : null;

    const routeDeleteToolMainButtons = selectedRoute
      ? List([
        new ButtonRecord({
          text: getLocalizedText('common.delete'),
          onPress: this._handleDeleteRoutePress,
        }),
      ])
      : List();

    const routeEditorToolSections = List([
      new ToolSectionRecord({
        component: RouteEditor,
        componentProps: {
          onEditPath: this._handleEditPath,
        },
      }),
    ]);

    let title;
    if (selectedRoute) {
      title = indexRouteSelected
        ? `${selectedRoute.title || selectedRoute.path} - Index`
        : selectedRoute.title;
    } else {
      title = getLocalizedText('structure.routeEditorTitle');
    }

    const titleEditable = !!selectedRoute && !indexRouteSelected;

    return new ToolRecord({
      id: TOOL_ID_PROPS_EDITOR,
      icon: <IconBrush />,
      name: getLocalizedText('structure.routeEditorTitle'),
      title,
      titleEditable,
      titlePlaceholder: getLocalizedText('structure.routeTitle'),
      subtitle: selectedRoute ? selectedRoute.path : '',
      sections: routeEditorToolSections,
      mainButtons: routeDeleteToolMainButtons,
      windowMinWidth: 360,
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
    const titlePlaceholder = getLocalizedText(
      'design.tool.componentConfiguration.enterTitle',
    );

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
    const routeEditorTool = this._getRouteEditorTool();

    let editorTool;

    if (this.props.propsViewMode === 'routeProps') {
      editorTool = routeEditorTool;
    } else {
      editorTool = propsEditorTool;
    }
    return List([List([libraryTool, treeTool, editorTool])]);
  }

  /**
   *
   * @param {string} action
   * @private
   */
  _handleShortcuts(action) {
    switch (action) {
      case 'UNDO':
        this.props.onUndo();
        break;
      case 'REDO':
        this.props.onRedo();
        break;

      case 'CREATE_CHILD_ROUTE': {
        const { project, selectedRouteId } = this.props;
        const { createRouteDialogIsVisible } = this.state;

        if (!createRouteDialogIsVisible) {
          const parentRoute = project.routes.get(selectedRouteId);
          this._handleNewRoutePress({ parentRoute });
        }

        break;
      }

      case 'CREATE_ROOT_ROUTE': {
        const { createRouteDialogIsVisible } = this.state;

        if (!createRouteDialogIsVisible) {
          this._handleNewRoutePress({ parentRoute: null });
        }

        break;
      }

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
          cursorPosition.containerId !== INVALID_ID || components.size === 0;

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

    this.setState(
      {
        confirmDeleteComponentDialogIsVisible: false,
      },
      () => {
        onDeleteComponent(firstSelectedComponentId);
      },
    );
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

  _renderDeleteRouteDialog() {
    const { getLocalizedText } = this.props;
    const { confirmDeleteDialogIsVisible } = this.state;

    const deleteRouteDialogButtons = [
      {
        text: getLocalizedText('common.delete'),
        onPress: this._handleDeleteRouteConfirm,
      },
      {
        text: getLocalizedText('common.cancel'),
        onPress: this._handleDeleteRouteCancel,
      },
    ];

    return (
      <Dialog
        title={getLocalizedText('structure.deleteRouteQuestion')}
        buttons={deleteRouteDialogButtons}
        backdrop
        minWidth={400}
        open={confirmDeleteDialogIsVisible}
        closeOnEscape
        closeOnBackdropClick
        onEnterKeyPress={this._handleDeleteRouteConfirm}
        onClose={this._handleDeleteRouteDialogClose}
      >
        {getLocalizedText('structure.deleteRouteConfirmationMessage')}
      </Dialog>
    );
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
      propsViewMode,
    } = this.props;

    const {
      createComponentMenuIsVisible,
      confirmDeleteComponentDialogIsVisible,
    } = this.state;

    const confirmDeleteDialogButtons = [
      {
        text: getLocalizedText('common.delete'),
        onPress: this._handleDeleteComponentConfirm,
      },
      {
        text: getLocalizedText('common.cancel'),
        onPress: this._handleDeleteComponentCancel,
      },
    ];

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

    const newRouteDialog = this._renderNewRouteDialog();
    const editRoutePathDialog = this._renderEditRoutePathDialog();
    const deleteRouteDialog = this._renderDeleteRouteDialog();

    let onToolTitleChange;

    if (propsViewMode === 'routeProps') {
      onToolTitleChange = this._handleToolRouteTitleChange;
    } else {
      onToolTitleChange = this._handleToolTitleChange;
    }

    return (
      <Shortcuts
        name="DESIGN_SCREEN"
        handler={this._handleShortcuts} // eslint-disable-line react/jsx-handler-names
        targetNodeSelector="body"
        className="booben-app"
      >
        <Desktop toolGroups={toolGroups} onToolTitleChange={onToolTitleChange}>
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
          {newRouteDialog}
          {editRoutePathDialog}
          {deleteRouteDialog}
        </Desktop>
      </Shortcuts>
    );
  }
}

DesignRoute.propTypes = propTypes;
DesignRoute.displayName = 'DesignRoute';

export default wrap(DesignRoute);
