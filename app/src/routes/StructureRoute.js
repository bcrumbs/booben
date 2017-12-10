/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Shortcuts } from 'react-shortcuts';
import { List } from 'immutable';
import { Container, Dialog } from '@reactackle/reactackle';

import {
  ToolBar,
  ToolBarGroup,
  ToolBarAction,
} from '../components/ToolBar/ToolBar';

import { AppWrapper } from '../components/AppWrapper/AppWrapper';

import {
  RoutesListWrapper,
  RoutesList,
  RouteCard,
  IndexRouteCard,
  RouteNewButton,
} from '../components/RoutesList/RoutesList';

import { Desktop } from '../containers/Desktop/Desktop';
import { RouteEditor } from '../containers/RouteEditor/RouteEditor';
import ProjectRecord from '../models/Project';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';

import {
  CreateRouteDialog,
  EditRoutePathDialog,
} from '../containers/route-dialogs';

import {
  createRoute,
  deleteRoute,
  updateRouteField,
  updateRoutePath,
  undo,
  redo,
} from '../actions/project';

import { selectRoute } from '../actions/structure';

import {
  getLocalizedTextFromState,
  canUndoSelector,
  canRedoSelector,
} from '../selectors';

import { findComponent } from '../lib/components';
import { TOOL_ID_ROUTE_EDITOR } from '../constants/tool-ids';

import {
  buildDesignRoutePath,
  buildDesignRouteIndexPath,
} from '../constants/paths';

import { INVALID_ID } from '../constants/misc';
import { IconUndo, IconRedo, IconTrash } from '../components/icons';

const propTypes = {
  project: PropTypes.instanceOf(ProjectRecord).isRequired, // store
  projectName: PropTypes.string.isRequired, // store
  selectedRouteId: PropTypes.number.isRequired, // store
  indexRouteSelected: PropTypes.bool.isRequired, // store
  canUndo: PropTypes.bool.isRequired, // store
  canRedo: PropTypes.bool.isRequired, // store
  getLocalizedText: PropTypes.func.isRequired, // store
  onSelectRoute: PropTypes.func.isRequired, // dispatch
  onCreateRoute: PropTypes.func.isRequired, // dispatch
  onDeleteRoute: PropTypes.func.isRequired, // dispatch
  onRenameRoute: PropTypes.func.isRequired, // dispatch
  onUpdateRoutePath: PropTypes.func.isRequired, // dispatch
  onOpenDesigner: PropTypes.func.isRequired, // dispatch
  onUndo: PropTypes.func.isRequired, // dispatch
  onRedo: PropTypes.func.isRequired, // dispatch
};

const mapStateToProps = state => ({
  project: state.project.data,
  projectName: state.project.projectName,
  selectedRouteId: state.project.selectedRouteId,
  indexRouteSelected: state.project.indexRouteSelected,
  canUndo: canUndoSelector(state),
  canRedo: canRedoSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onSelectRoute: (routeId, indexRouteSelected) =>
    void dispatch(selectRoute(routeId, indexRouteSelected)),

  onCreateRoute: (parentRouteId, path, title, paramValues) =>
    void dispatch(createRoute(parentRouteId, path, title, paramValues)),

  onDeleteRoute: routeId =>
    void dispatch(deleteRoute(routeId)),

  onRenameRoute: (routeId, newTitle) =>
    void dispatch(updateRouteField(routeId, 'title', newTitle)),

  onUpdateRoutePath: (routeId, newPath, newParamValues, renamedParams) =>
    void dispatch(updateRoutePath(
      routeId,
      newPath,
      newParamValues,
      renamedParams,
    )),

  onOpenDesigner: ({ projectName, routeId, isIndexRoute }) => {
    const path = isIndexRoute
      ? buildDesignRouteIndexPath({ projectName, routeId })
      : buildDesignRoutePath({ projectName, routeId });

    dispatch(push(path));
  },

  onUndo: () => void dispatch(undo()),
  onRedo: () => void dispatch(redo()),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

/**
 *
 * @param {string} rawPath
 * @param {boolean} isRootRoute
 * @return {string}
 */
const normalizePath = (rawPath, isRootRoute) =>
  isRootRoute ? `/${rawPath}` : rawPath;

/**
 *
 * @param {Immutable.Map<number, Object>} routes
 * @param {number} routeId
 * @param {boolean} isIndexRoute
 * @return {boolean}
 */
const isRouteEditable = (routes, routeId, isIndexRoute) => {
  const parentIds = [];

  if (isIndexRoute) {
    parentIds.push(routeId);
  }

  let currentRoute = routes.get(routeId);

  while (currentRoute.parentId !== INVALID_ID) {
    parentIds.push(currentRoute.parentId);
    currentRoute = routes.get(currentRoute.parentId);
  }

  return parentIds.every(id => {
    const route = routes.get(id);
    const outlet = findComponent(
      route.components,
      route.component,
      component => component.name === 'Outlet',
    );

    return outlet !== null;
  });
};

class StructureRoute extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
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

    this._handleShortcuts =
      this._handleShortcuts.bind(this);
    this._handleRouteSelect =
      this._handleRouteSelect.bind(this);
    this._handleRouteGo =
      this._handleRouteGo.bind(this);
    this._handleNewRoutePress =
      this._handleNewRoutePress.bind(this);
    this._handleSelectedRouteGo =
      this._handleSelectedRouteGo.bind(this);
    this._handleEditPath =
      this._handleEditPath.bind(this);
    this._handleToolTitleChange =
      this._handleToolTitleChange.bind(this);
    this._handleDeleteRoutePress =
      this._handleDeleteRoutePress.bind(this);
    this._handleDeleteRouteDialogClose =
      this._handleDeleteRouteDialogClose.bind(this);
    this._handleDeleteRouteConfirm =
      this._handleDeleteRouteConfirm.bind(this);
    this._handleDeleteRouteCancel =
      this._handleDeleteRouteCancel.bind(this);
    this._handleCreateRouteDialogClose =
      this._handleCreateRouteDialogClose.bind(this);
    this._handleCreateRouteDialogSubmit =
      this._handleCreateRouteDialogSubmit.bind(this);
    this._handleEditPathDialogSubmit =
      this._handleEditPathDialogSubmit.bind(this);
    this._handleEditPathDialogClose =
      this._handleEditPathDialogClose.bind(this);

    this._routePathInput = null;
    this._toolGroups = this._getTools(
      props.project,
      props.selectedRouteId,
      props.indexRouteSelected,
      props.getLocalizedText,
    );
  }

  componentWillReceiveProps(nextProps) {
    const willReCreateTools =
      nextProps.project !== this.props.project ||
      nextProps.selectedRouteId !== this.props.selectedRouteId ||
      nextProps.indexRouteSelected !== this.props.indexRouteSelected ||
      nextProps.getLocalizedText !== this.props.getLocalizedText;

    if (willReCreateTools) {
      this._toolGroups = this._getTools(
        nextProps.project,
        nextProps.selectedRouteId,
        nextProps.indexRouteSelected,
        nextProps.getLocalizedText,
      );
    }
  }

  _getTools(project, selectedRouteId, indexRouteSelected, getLocalizedText) {
    const selectedRoute = selectedRouteId !== -1
      ? project.routes.get(selectedRouteId)
      : null;

    const routeEditorToolMainButtons = selectedRoute
      ? List([
        new ButtonRecord({
          text: getLocalizedText('common.edit'),
          disabled: !isRouteEditable(
            project.routes,
            selectedRouteId,
            indexRouteSelected,
          ),

          onPress: this._handleSelectedRouteGo,
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

    return List([
      List([
        new ToolRecord({
          id: TOOL_ID_ROUTE_EDITOR,
          icon: 'random',
          name: getLocalizedText('structure.routeEditorTitle'),
          title,
          titleEditable,
          titlePlaceholder: getLocalizedText('structure.routeTitle'),
          subtitle: selectedRoute ? selectedRoute.path : '',
          sections: routeEditorToolSections,
          mainButtons: routeEditorToolMainButtons,
          windowMinWidth: 360,
        }),
      ]),
    ]);
  }

  /**
   *
   * @param {string} action
   * @private
   */
  _handleShortcuts(action) {
    const { onUndo, onRedo } = this.props;

    switch (action) {
      case 'UNDO': onUndo(); break;
      case 'REDO': onRedo(); break;

      case 'DELETE_ROUTE': {
        const { indexRouteSelected } = this.props;

        if (!indexRouteSelected) {
          this._handleDeleteRoutePress();
        }

        break;
      }

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

      case 'SELECT_NEXT_ROUTE': this._handleSelectNextRoute(); break;
      case 'SELECT_PREVIOUS_ROUTE': this._handleSelectPreviousRoute(); break;
      case 'SELECT_CHILD_ROUTE': this._handleSelectChildRoute(); break;
      case 'SELECT_PARENT_ROUTE': this._handleSelectParentRoute(); break;
      case 'GO_TO_DESIGN': {
        const { project, selectedRouteId, indexRouteSelected } = this.props;

        const isEditable = isRouteEditable(
          project.routes,
          selectedRouteId,
          indexRouteSelected,
        );

        if (isEditable) {
          this._handleSelectedRouteGo();
        }

        break;
      }

      default:
    }
  }

  /**
   *
   * @param {number} routeId
   * @param {boolean} isIndexRoute
   * @private
   */
  _handleRouteSelect({ routeId, isIndexRoute }) {
    const { selectedRouteId, indexRouteSelected, onSelectRoute } = this.props;

    if (
      routeId !== selectedRouteId ||
      isIndexRoute !== indexRouteSelected
    ) {
      onSelectRoute(routeId, isIndexRoute);
    }
  }

  _handleSelectNextRoute() {
    const {
      project,
      selectedRouteId,
      indexRouteSelected,
      onSelectRoute,
    } = this.props;

    const currentRoute = project.routes.get(selectedRouteId);

    if (indexRouteSelected) {
      if (currentRoute.children.size > 0) {
        const nextRouteId = currentRoute.children.first();
        onSelectRoute(nextRouteId, false);
      }
    } else {
      const isRootRoute = currentRoute.parentId === INVALID_ID;
      const currentRoutesList = isRootRoute
        ? project.rootRoutes
        : project.routes.get(currentRoute.parentId).children;

      const currentRoutePosition = currentRoutesList.indexOf(selectedRouteId);

      if (currentRoutePosition < currentRoutesList.size - 1) {
        const nextRouteId = currentRoutesList.get(currentRoutePosition + 1);
        onSelectRoute(nextRouteId, false);
      }
    }
  }

  _handleSelectPreviousRoute() {
    const {
      project,
      selectedRouteId,
      indexRouteSelected,
      onSelectRoute,
    } = this.props;

    const currentRoute = project.routes.get(selectedRouteId);

    if (!indexRouteSelected) {
      const isRootRoute = currentRoute.parentId === INVALID_ID;
      const parentRoute = isRootRoute
        ? null
        : project.routes.get(currentRoute.parentId);

      const currentRoutesList = isRootRoute
        ? project.rootRoutes
        : parentRoute.children;

      const currentRoutePosition = currentRoutesList.indexOf(selectedRouteId);

      if (currentRoutePosition > 0) {
        const nextRouteId = currentRoutesList.get(currentRoutePosition - 1);
        onSelectRoute(nextRouteId, false);
      } else if (!isRootRoute && parentRoute.haveIndex) {
        onSelectRoute(parentRoute.id, true);
      }
    }
  }

  _handleSelectParentRoute() {
    const {
      project,
      selectedRouteId,
      indexRouteSelected,
      onSelectRoute,
    } = this.props;

    const currentRoute = project.routes.get(selectedRouteId);
    const isRootRoute = currentRoute.parentId === INVALID_ID;

    if (indexRouteSelected) {
      onSelectRoute(selectedRouteId, false);
    } else if (!isRootRoute) {
      onSelectRoute(currentRoute.parentId, false);
    }
  }

  _handleSelectChildRoute() {
    const {
      project,
      selectedRouteId,
      indexRouteSelected,
      onSelectRoute,
    } = this.props;

    if (!indexRouteSelected) {
      const currentRoute = project.routes.get(selectedRouteId);

      if (currentRoute.haveIndex) {
        onSelectRoute(selectedRouteId, true);
      } else if (currentRoute.children.size > 0) {
        onSelectRoute(currentRoute.children.first(), false);
      }
    }
  }

  /**
   *
   * @param {number} routeId
   * @param {boolean} isIndexRoute
   * @private
   */
  _handleRouteGo({ routeId, isIndexRoute }) {
    const { projectName, onOpenDesigner } = this.props;
    onOpenDesigner({ projectName, routeId, isIndexRoute });
  }

  /**
   *
   * @private
   */
  _handleSelectedRouteGo() {
    const { selectedRouteId, indexRouteSelected } = this.props;

    this._handleRouteGo({
      routeId: selectedRouteId,
      isIndexRoute: indexRouteSelected,
    });
  }

  /**
   *
   * @private
   */
  _handleEditPath() {
    const { project, selectedRouteId } = this.props;

    const route = project.routes.get(selectedRouteId);
    const isRootRoute = route.parentId === INVALID_ID;

    // Remove leading / from root route path
    const displayPath = isRootRoute ? route.path.slice(1) : route.path;

    this.setState({
      editRoutePathDialogIsVisible: true,
      editingRouteId: selectedRouteId,
      newRoutePath: displayPath,
      newRouteParamValues: route.paramValues.toObject(),
    }, () => {
      if (this._routePathInput) this._routePathInput.focus();
    });
  }

  /**
   *
   * @private
   */
  _handleDeleteRoutePress() {
    this.setState({ confirmDeleteDialogIsVisible: true });
  }

  /**
   *
   * @private
   */
  _handleDeleteRouteDialogClose() {
    this.setState({ confirmDeleteDialogIsVisible: false });
  }

  /**
   *
   * @param {Function} closeDialog
   * @private
   */
  _handleDeleteRouteConfirm(closeDialog) {
    this.props.onDeleteRoute(this.props.selectedRouteId);
    closeDialog();
  }

  /**
   *
   * @param {Function} closeDialog
   * @private
   */
  _handleDeleteRouteCancel(closeDialog) {
    closeDialog();
  }

  /**
   *
   * @param {Object} parentRoute
   * @private
   */
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

  /**
   *
   * @private
   */
  _handleCreateRouteDialogClose() {
    this.setState({
      createRouteDialogIsVisible: false,
      createRouteParentId: INVALID_ID,
    });
  }

  /**
   *
   * @param {Object} data
   * @private
   */
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

  /**
   *
   * @param {Object} tool
   * @param {string} newTitle
   * @private
   */
  _handleToolTitleChange(tool, newTitle) {
    if (tool.id === TOOL_ID_ROUTE_EDITOR) {
      this.props.onRenameRoute(this.props.selectedRouteId, newTitle);
    }
  }

  /**
   *
   * @private
   */
  _handleEditPathDialogClose() {
    this.setState({
      editRoutePathDialogIsVisible: false,
      editingRouteId: INVALID_ID,
    });
  }

  /**
   *
   * @param {Object} data
   * @private
   */
  _handleEditPathDialogSubmit(data) {
    const { project, onUpdateRoutePath } = this.props;

    const {
      editingRouteId,
      newRoutePath,
      newRouteParamValues,
    } = data;

    const route = project.routes.get(editingRouteId);
    const isRootRoute = route.parentId === INVALID_ID;
    const path = normalizePath(newRoutePath, isRootRoute);

    onUpdateRoutePath(
      editingRouteId,
      path,
      newRouteParamValues,
      {},
    );
  }

  /**
   *
   * @param {Immutable.List<Object>} routes
   * @param {Object} parentRoute
   * @param {Immutable.List<number>} routesIds
   * @param {boolean} [parentWithoutOutlet=false]
   * @return {ReactElement}
   * @private
   */
  _renderRouteList(
    routes,
    parentRoute,
    routesIds,
    parentWithoutOutlet = false,
  ) {
    const {
      selectedRouteId,
      indexRouteSelected,
      getLocalizedText,
    } = this.props;

    let routeCards = routesIds
      ? routesIds.map(routeId => this._renderRouteCard(
        routes,
        routeId,
        parentWithoutOutlet,
      ))
      : null;

    if (parentRoute && parentRoute.haveIndex && !parentRoute.redirect) {
      const isSelected =
        selectedRouteId === parentRoute.id &&
        indexRouteSelected;

      if (routeCards) {
        routeCards = routeCards.unshift(
          <IndexRouteCard
            key={`${String(parentRoute.id)}-index`}
            routeId={parentRoute.id}
            title={getLocalizedText('structure.indexRouteTitle')}
            focused={isSelected}
            onFocus={this._handleRouteSelect}
            onGo={this._handleRouteGo}
          />,
        );
      }
    }

    const needButton = parentRoute === null || (
      !indexRouteSelected &&
      selectedRouteId !== -1 &&
      parentRoute.id === selectedRouteId
    );

    let button = null;
    if (needButton) {
      const text = getLocalizedText(
        parentRoute ? 'structure.newRoute' : 'structure.newRootRoute',
      );

      button = (
        <RouteNewButton
          parentRoute={parentRoute}
          text={text}
          onPress={this._handleNewRoutePress}
        />
      );
    }

    return (
      <RoutesList focused={needButton}>
        {routeCards}
        {button}
      </RoutesList>
    );
  }

  /**
   *
   * @param {Immutable.List<Object>} routes
   * @param {number} routeId
   * @param {boolean} [parentWithoutOutlet=false]
   * @return {ReactElement}
   * @private
   */
  _renderRouteCard(routes, routeId, parentWithoutOutlet = false) {
    const {
      selectedRouteId,
      indexRouteSelected,
      getLocalizedText,
    } = this.props;

    const route = routes.get(routeId);
    const isSelected = selectedRouteId === route.id && !indexRouteSelected;
    const willRenderChildren = route.children.size > 0 || route.haveIndex;

    let outletWarning = false;
    let outletWarningTooltip = '';

    if (route.children.size > 0) {
      const outlet = findComponent(
        route.components,
        route.component,
        component => component.name === 'Outlet',
      );

      if (outlet === null) {
        outletWarning = true;
        outletWarningTooltip =
          getLocalizedText('structure.noOutletMarkTooltip');
      }
    }

    let children = null;
    if (willRenderChildren) {
      children = this._renderRouteList(
        routes,
        route,
        route.children,
        parentWithoutOutlet || outletWarning,
      );
    } else {
      children = isSelected
        ? this._renderRouteList(
          routes,
          route,
          null,
          parentWithoutOutlet || outletWarning,
        )
        : null;
    }

    let parentOutletWarningMessage = null;
    let disabled = false;

    if (parentWithoutOutlet) {
      disabled = true;

      if (isSelected) {
        const messageText = getLocalizedText(
          'structure.noOutletWarning',
        );

        parentOutletWarningMessage = (
          <span>{messageText}</span>
        );
      }
    }

    return (
      <RouteCard
        key={String(route.id)}
        route={route}
        focused={isSelected}
        disabled={disabled}
        alertMark={outletWarning}
        alertTooltip={outletWarningTooltip}
        message={parentOutletWarningMessage}
        onFocus={this._handleRouteSelect}
        onGo={this._handleRouteGo}
      >
        {children}
      </RouteCard>
    );
  }

  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderNewRouteDialog() {
    const {
      createRouteParentId,
      createRouteDialogIsVisible,
    } = this.state;

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

  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderEditRoutePathDialog() {
    const {
      editRoutePathDialogIsVisible,
      editingRouteId,
    } = this.state;

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

  _renderDeleteRouteDialog() {
    const { getLocalizedText } = this.props;
    const { confirmDeleteDialogIsVisible } = this.state;

    const deleteRouteDialogButtons = [{
      text: getLocalizedText('common.delete'),
      onPress: this._handleDeleteRouteConfirm,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleDeleteRouteCancel,
    }];

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

  _renderContent() {
    const { project } = this.props;

    const routesList =
      this._renderRouteList(project.routes, null, project.rootRoutes);

    return (
      <RoutesListWrapper>
        <Container spread>
          {routesList}
        </Container>
      </RoutesListWrapper>
    );
  }

  render() {
    const {
      canUndo,
      canRedo,
      selectedRouteId,
      indexRouteSelected,
      getLocalizedText,
      onUndo,
      onRedo,
    } = this.props;

    const isDeletable = selectedRouteId !== INVALID_ID && !indexRouteSelected;
    const content = this._renderContent();
    const newRouteDialog = this._renderNewRouteDialog();
    const editRoutePathDialog = this._renderEditRoutePathDialog();
    const deleteRouteDialog = this._renderDeleteRouteDialog();

    return (
      <Shortcuts
        name="STRUCTURE_SCREEN"
        handler={this._handleShortcuts} // eslint-disable-line react/jsx-handler-names
        targetNodeSelector="body"
        className="jssy-app"
      >
        <Desktop
          toolGroups={this._toolGroups}
          onToolTitleChange={this._handleToolTitleChange}
        >
          <ToolBar>
            <ToolBarGroup>
              <ToolBarAction
                icon={<IconTrash />}
                tooltipText={getLocalizedText('toolbar.structure.delete')}
                disabled={!isDeletable}
                onPress={this._handleDeleteRoutePress}
              />
            </ToolBarGroup>

            <ToolBarGroup>
              <ToolBarAction
                icon={<IconUndo />}
                tooltipText={getLocalizedText('toolbar.common.undo')}
                disabled={!canUndo}
                onPress={onUndo}
              />

              <ToolBarAction
                icon={<IconRedo />}
                tooltipText={getLocalizedText('toolbar.common.redo')}
                disabled={!canRedo}
                onPress={onRedo}
              />
            </ToolBarGroup>
          </ToolBar>

          <AppWrapper>
            <Shortcuts
              name="ROUTES_LIST"
              handler={this._handleShortcuts} // eslint-disable-line react/jsx-handler-names
              className="jssy-app"
            >
              {content}
            </Shortcuts>
          </AppWrapper>

          {newRouteDialog}
          {editRoutePathDialog}
          {deleteRouteDialog}
        </Desktop>
      </Shortcuts>
    );
  }
}

StructureRoute.propTypes = propTypes;
StructureRoute.displayName = 'StructureRoute';

export default wrap(StructureRoute);
