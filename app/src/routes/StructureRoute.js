/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Shortcuts } from 'react-shortcuts';
import { List } from 'immutable';

import {
  Panel,
  PanelContent,
  Container,
  Row,
  Column,
  Dialog,
  Form,
  FormItem,
  Input,
} from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '@jssy/common-ui';

import {
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
  createRoute,
  deleteRoute,
  updateRouteField,
  updateRoutePath,
  undo,
  redo,
} from '../actions/project';

import { selectRoute } from '../actions/structure';
import { getLocalizedTextFromState } from '../selectors';

import {
  arrayToObject,
  objectToArray,
  objectSome,
  objectEvery,
  returnArg,
  isUndef,
  isTruthy,
  isFalsy,
} from '../utils/misc';

import { TOOL_ID_ROUTE_EDITOR } from '../constants/toolIds';

import {
  buildDesignRoutePath,
  buildDesignRouteIndexPath,
} from '../constants/paths';

import { INVALID_ID } from '../constants/misc';

const propTypes = {
  project: PropTypes.instanceOf(ProjectRecord).isRequired, // store
  projectName: PropTypes.string.isRequired, // store
  selectedRouteId: PropTypes.number.isRequired, // store
  indexRouteSelected: PropTypes.bool.isRequired, // store
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

const mapStateToProps = ({ project, app }) => ({
  project: project.data,
  projectName: project.projectName,
  selectedRouteId: project.selectedRouteId,
  indexRouteSelected: project.indexRouteSelected,
  getLocalizedText: getLocalizedTextFromState({ app }),
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
 * @type {RegExp}
 */
const ROUTE_PATH_PATTERN = /^[a-zA-Z0-9\-_/:]+$/;

/**
 *
 * @param {string} path
 * @return {string[]}
 */
const splitPath = path => path.split('/');

/**
 *
 * @param {string} pathPart
 * @return {boolean}
 */
const isRouteParam = pathPart =>
  pathPart.length > 1 &&
  pathPart.startsWith(':');

/**
 *
 * @param {string} pathPart
 * @return {string}
 */
const routeParamName = pathPart => pathPart.slice(1);

/**
 *
 * @param {string} oldPath
 * @param {string} newPath
 * @param {boolean} [reverse=false]
 * @return {Object<string, string>}
 */
const getRenamedRouteParams = (oldPath, newPath, reverse = false) => {
  const oldParts = splitPath(oldPath);
  const parts = splitPath(newPath);
  const renamedParams = {};
  
  for (let i = 0, l = Math.min(oldParts.length, parts.length); i < l; i++) {
    const oldPart = oldParts[i];
    const newPart = parts[i];
    const isOldParam = isRouteParam(oldPart);
    const isNewParam = isRouteParam(newPart);
    
    if (isOldParam && isNewParam && oldPart !== newPart) {
      if (reverse) {
        renamedParams[routeParamName(newPart)] = routeParamName(oldPart);
      } else {
        renamedParams[routeParamName(oldPart)] = routeParamName(newPart);
      }
    }
  }
  
  return renamedParams;
};

/**
 *
 * @param {string} rawPath
 * @param {boolean} isRootRoute
 * @return {string}
 */
const normalizePath = (rawPath, isRootRoute) => {
  if (isRootRoute) return !rawPath.startsWith('/') ? `/${rawPath}` : rawPath;
  else return rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
};

class StructureRoute extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      confirmDeleteDialogIsVisible: false,
      createRouteDialogIsVisible: false,
      createRouteParentId: -1,
      editRoutePathDialogIsVisible: false,
      editingPathOfRouteId: INVALID_ID,
      newRoutePath: '',
      newRouteTitle: '',
      newRouteParamValues: {},
      pathPatternError: false,
    };

    this._saveNewRouteTitleInputRef =
      this._saveNewRouteTitleInputRef.bind(this);
    this._saveRoutePathInputRef =
      this._saveRoutePathInputRef.bind(this);

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
    this._handleNewRouteTitleChange =
      this._handleNewRouteTitleChange.bind(this);
    this._handleNewRoutePathChange =
      this._handleNewRoutePathChange.bind(this);
    this._handlePathInputPatternError =
      this._handlePathInputPatternError.bind(this);
    this._handlePathInputBlur =
      this._handlePathInputBlur.bind(this);
    this._handleCreateRouteCancel =
      this._handleCreateRouteCancel.bind(this);
    this._handleCreateRouteCreate =
      this._handleCreateRouteCreate.bind(this);
    this._handleCreateRouteDialogEnterKey =
      this._handleCreateRouteDialogEnterKey.bind(this);
    this._handleEditPathSave =
      this._handleEditPathSave.bind(this);
    this._handleEditRouteCancel =
      this._handleEditRouteCancel.bind(this);
    this._handleEditPathDialogClose =
      this._handleEditPathDialogClose.bind(this);
    this._handleEditPathDialogEnterKey =
      this._handleEditPathDialogEnterKey.bind(this);
  
    this._newRouteTitleInput = null;
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
          onPress: this._handleSelectedRouteGo,
        }),
      ])
      : List();
    
    const routeEditorToolSecondaryButtons = selectedRoute
      ? List([
        new ButtonRecord({
          icon: 'trash-o',
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
          secondaryButtons: routeEditorToolSecondaryButtons,
          windowMinWidth: 360,
        }),
      ]),
    ]);
  }

  /**
   *
   * @param {number} parentRouteId
   * @param {string} newRoutePath
   * @param {number} [editedRouteId]
   * @return {boolean}
   * @private
   */
  _isRouteAlreadyExist(
    parentRouteId,
    newRoutePath,
    editedRouteId = INVALID_ID,
  ) {
    const { project } = this.props;
    
    const isRootRoute = parentRouteId === INVALID_ID;
    
    if (isRootRoute) {
      const siblingIds = project.rootRoutes;
      const actualNewRoutePath = `/${newRoutePath}`;
      
      const haveExistingRootRoutes = siblingIds.some(
        routeId =>
          routeId !== editedRouteId &&
          project.routes.get(routeId).path === actualNewRoutePath,
      );
      
      if (haveExistingRootRoutes) return true;
      
      const slashRouteId = project.rootRoutes.find(
        routeId => project.routes.get(routeId).path === '/',
      );
      
      if (isUndef(slashRouteId)) return false;
      
      return project.routes.get(slashRouteId).children.some(
        routeId =>
          routeId !== editedRouteId &&
          project.routes.get(routeId).path === newRoutePath,
      );
    } else {
      const siblingIds = project.routes.get(parentRouteId).children;
      
      return siblingIds.some(
        routeId =>
          routeId !== editedRouteId &&
          project.routes.get(routeId).path === newRoutePath,
      );
    }
  }

  /**
   *
   * @param {Object} ref
   * @private
   */
  _saveNewRouteTitleInputRef(ref) {
    this._newRouteTitleInput = ref;
  }

  /**
   *
   * @param {Object} ref
   * @private
   */
  _saveRoutePathInputRef(ref) {
    this._routePathInput = ref;
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
      case 'GO_TO_DESIGN': this._handleSelectedRouteGo(); break;
      
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
      editingPathOfRouteId: selectedRouteId,
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
    }, () => {
      if (this._newRouteTitleInput) this._newRouteTitleInput.focus();
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
   * @param {string} newPath
   * @private
   */
  _handleNewRoutePathChange({ value: newPath }) {
    const { newRoutePath: oldPath, newRouteParamValues } = this.state;
    
    const renamedParams = getRenamedRouteParams(oldPath, newPath, true);

    const getNewParamValue = paramName =>
      newRouteParamValues[paramName] || (
        renamedParams[paramName]
          ? newRouteParamValues[renamedParams[paramName]]
          : ''
      );
    
    const params = splitPath(newPath)
      .filter(isRouteParam)
      .map(routeParamName);

    const updatedParamValues = arrayToObject(
      params,
      returnArg,
      getNewParamValue,
    );
    
    this.setState({
      newRoutePath: newPath,
      pathPatternError: false,
      newRouteParamValues: updatedParamValues,
    });
  }
  
  /**
   *
   * @private
   */
  _handlePathInputPatternError() {
    this.setState({ pathPatternError: true });
  }
  
  /**
   *
   * @private
   */
  _handlePathInputBlur() {
    this.setState({ pathPatternError: false });
  }

  /**
   *
   * @param {string} value
   * @private
   */
  _handleNewRouteTitleChange({ value }) {
    this.setState({
      newRouteTitle: value,
    });
  }
  
  /**
   *
   * @param {string} paramName
   * @param {string} value
   * @private
   */
  _handleNewRouteParamChange(paramName, { value }) {
    const { newRouteParamValues } = this.state;
    
    this.setState({
      newRouteParamValues: {
        ...newRouteParamValues,
        [paramName]: value,
      },
    });
  }

  /**
   *
   * @param {Function} closeDialog
   * @private
   */
  _handleCreateRouteCancel(closeDialog) {
    closeDialog();
  }

  /**
   *
   * @param {Function} closeDialog
   * @private
   */
  _handleCreateRouteCreate(closeDialog) {
    const { onCreateRoute } = this.props;
    const {
      createRouteParentId,
      newRoutePath,
      newRouteTitle,
      newRouteParamValues,
    } = this.state;
    
    const isRootRoute = createRouteParentId === -1;
    const rawPath = newRoutePath.trim();
    const title = newRouteTitle.trim();
    const path = normalizePath(rawPath, isRootRoute);

    onCreateRoute(createRouteParentId, path, title, newRouteParamValues);
    closeDialog();
  }

  /**
   *
   * @param {Function} closeDialog
   * @private
   */
  _handleCreateRouteDialogEnterKey(closeDialog) {
    const {
      createRouteParentId,
      newRouteTitle,
      newRoutePath,
      newRouteParamValues,
    } = this.state;

    const creatingRootRoute = createRouteParentId === -1;
    const routeAlreadyExists = this._isRouteAlreadyExist(
      createRouteParentId,
      newRoutePath,
    );

    const isValid =
      !!newRouteTitle &&
      !routeAlreadyExists &&
      (creatingRootRoute || !!newRoutePath) &&
      objectEvery(newRouteParamValues, isTruthy);

    if (isValid) this._handleCreateRouteCreate(closeDialog);
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
      editingPathOfRouteId: INVALID_ID,
    });
  }

  /**
   *
   * @param {Function} closeDialog
   * @private
   */
  _handleEditRouteCancel(closeDialog) {
    closeDialog();
  }

  /**
   *
   * @param {Function} closeDialog
   * @private
   */
  _handleEditPathSave(closeDialog) {
    const { project, onUpdateRoutePath } = this.props;

    const {
      editingPathOfRouteId,
      newRoutePath,
      newRouteParamValues,
    } = this.state;

    const route = project.routes.get(editingPathOfRouteId);
    const isRootRoute = route.parentId === INVALID_ID;
    const rawPath = newRoutePath.trim();
    const path = normalizePath(rawPath, isRootRoute);
    const renamedParams = getRenamedRouteParams(route.path, path);

    onUpdateRoutePath(
      editingPathOfRouteId,
      path,
      newRouteParamValues,
      renamedParams,
    );
    
    closeDialog();
  }

  _handleEditPathDialogEnterKey(closeDialog) {
    const { project } = this.props;

    const {
      editingPathOfRouteId,
      newRoutePath,
      newRouteParamValues,
    } = this.state;

    const route = project.routes.get(editingPathOfRouteId);
    const isRootRoute = route.parentId === INVALID_ID;
    const routeAlreadyExists = this._isRouteAlreadyExist(
      route.parentId,
      newRoutePath,
      editingPathOfRouteId,
    );

    const isValid =
      !routeAlreadyExists &&
      (isRootRoute || !!newRoutePath) &&
      objectEvery(newRouteParamValues, isTruthy);

    if (isValid) this._handleEditPathSave(closeDialog);
  }

  /**
   *
   * @param {Immutable.List<Object>} routes
   * @param {Object} parentRoute
   * @param {Immutable.List<number>} routesIds
   * @return {ReactElement}
   * @private
   */
  _renderRouteList(routes, parentRoute, routesIds) {
    const {
      selectedRouteId,
      indexRouteSelected,
      getLocalizedText,
    } = this.props;

    let routeCards = routesIds
      ? routesIds.map(routeId => this._renderRouteCard(routes, routeId))
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

    //noinspection JSValidateTypes
    return (
      <RoutesList>
        {routeCards}
        {button}
      </RoutesList>
    );
  }

  /**
   *
   * @param {Immutable.List<Object>} routes
   * @param {number} routeId
   * @return {ReactElement}
   * @private
   */
  _renderRouteCard(routes, routeId) {
    const { selectedRouteId, indexRouteSelected } = this.props;
    
    const route = routes.get(routeId);
    const isSelected = selectedRouteId === route.id && !indexRouteSelected;
    const willRenderChildren = route.children.size > 0 || route.haveIndex;
    
    let children = null;
    if (willRenderChildren) {
      children = this._renderRouteList(routes, route, route.children);
    } else {
      children = isSelected ? this._renderRouteList(routes, route, null) : null;
    }

    //noinspection JSValidateTypes
    return (
      <RouteCard
        key={String(route.id)}
        route={route}
        focused={isSelected}
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
    const { getLocalizedText } = this.props;
  
    const {
      createRouteParentId,
      newRouteTitle,
      newRoutePath,
      newRouteParamValues,
      createRouteDialogIsVisible,
      pathPatternError,
    } = this.state;
    
    const creatingRootRoute = createRouteParentId === -1;
    const routeAlreadyExists = this._isRouteAlreadyExist(
      createRouteParentId,
      newRoutePath,
    );

    const isCreateButtonDisabled =
      !newRouteTitle ||
      routeAlreadyExists ||
      (!creatingRootRoute && !newRoutePath) ||
      objectSome(newRouteParamValues, isFalsy);

    const dialogTitle = getLocalizedText(
      creatingRootRoute
        ? 'structure.createNewRootRoute'
        : 'structure.createNewRoute',
    );
    
    const dialogButtons = [{
      text: getLocalizedText('common.create'),
      disabled: isCreateButtonDisabled,
      onPress: this._handleCreateRouteCreate,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleCreateRouteCancel,
    }];
  
    const pathInputStyle = (routeAlreadyExists || pathPatternError)
      ? 'error'
      : 'neutral';
  
    let pathInputMessage = '';
    if (pathPatternError) {
      pathInputMessage = getLocalizedText('structure.pathErrorMessage');
    } else if (routeAlreadyExists) {
      const actualPath = creatingRootRoute
        ? `/${newRoutePath}`
        : newRoutePath;
    
      pathInputMessage = getLocalizedText(
        'structure.routeAlreadyExistsMessage',
        { path: actualPath },
      );
    }
  
    const pathInputPrefix = creatingRootRoute ? '/' : '';
  
    let routeParamsBoxHeading = null;
    let routeParamsBoxItem = null;
    
    /* eslint-disable react/jsx-no-bind */
    const routeParamInputs = objectToArray(
      newRouteParamValues,
      
      (paramValue, paramName) => (
        <FormItem>
          <Input
            key={paramName}
            label={paramName}
            value={paramValue}
            onChange={this._handleNewRouteParamChange.bind(this, paramName)}
          />
        </FormItem>
      ),
    );
    /* eslint-enable react/jsx-no-bind */
    
    if (routeParamInputs.length) {
      routeParamsBoxHeading = (
        <BlockContentBoxHeading>
          {getLocalizedText('structure.routeParamValuesHeading')}
        </BlockContentBoxHeading>
      );
  
      routeParamsBoxItem = (
        <BlockContentBoxItem blank>
          <Form>
            {routeParamInputs}
          </Form>
        </BlockContentBoxItem>
      );
    }
    
    return (
      <Dialog
        title={dialogTitle}
        buttons={dialogButtons}
        backdrop
        minWidth={400}
        open={createRouteDialogIsVisible}
        closeOnEscape
        closeOnBackdropClick
        onEnterKeyPress={this._handleCreateRouteDialogEnterKey}
        onClose={this._handleCreateRouteDialogClose}
      >
        <BlockContent>
          <BlockContentBox>
            <BlockContentBoxItem blank>
              <Form>
                <FormItem>
                  <Input
                    ref={this._saveNewRouteTitleInputRef}
                    label={getLocalizedText('structure.title')}
                    value={newRouteTitle}
                    onChange={this._handleNewRouteTitleChange}
                  />
                </FormItem>

                <FormItem>
                  <Input
                    label={getLocalizedText('structure.path')}
                    value={newRoutePath}
                    pattern={ROUTE_PATH_PATTERN}
                    prefix={pathInputPrefix}
                    colorScheme={pathInputStyle}
                    message={pathInputMessage}
                    onChange={this._handleNewRoutePathChange}
                    onPatternError={this._handlePathInputPatternError}
                    onBlur={this._handlePathInputBlur}
                  />
                </FormItem>
              </Form>
            </BlockContentBoxItem>
          </BlockContentBox>
          
          <BlockContentBox>
            {routeParamsBoxHeading}
            {routeParamsBoxItem}
          </BlockContentBox>
        </BlockContent>
      </Dialog>
    );
  }

  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderEditRoutePathDialog() {
    const { project, getLocalizedText } = this.props;
    const {
      editRoutePathDialogIsVisible,
      editingPathOfRouteId,
      newRoutePath,
      newRouteParamValues,
      pathPatternError,
    } = this.state;

    if (!editRoutePathDialogIsVisible) return null;

    const route = project.routes.get(editingPathOfRouteId);
    const isRootRoute = route.parentId === INVALID_ID;
    const routeAlreadyExists = this._isRouteAlreadyExist(
      route.parentId,
      newRoutePath,
      editingPathOfRouteId,
    );

    const pathInputStyle = (routeAlreadyExists || pathPatternError)
      ? 'error'
      : 'neutral';

    let pathInputMessage = '';
    if (pathPatternError) {
      pathInputMessage = getLocalizedText('structure.pathErrorMessage');
    } else if (routeAlreadyExists) {
      const actualPath = isRootRoute ? `/${newRoutePath}` : newRoutePath;

      pathInputMessage = getLocalizedText(
        'structure.routeAlreadyExistsMessage',
        { path: actualPath },
      );
    }

    const isSaveButtonDisabled =
      routeAlreadyExists ||
      (!isRootRoute && !newRoutePath) ||
      objectSome(newRouteParamValues, isFalsy);

    const dialogTitle = getLocalizedText('structure.editRoutePathDialogTitle');

    const dialogButtons = [{
      text: getLocalizedText('common.save'),
      disabled: isSaveButtonDisabled,
      onPress: this._handleEditPathSave,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleEditRouteCancel,
    }];

    const pathInputPrefix = isRootRoute ? '/' : '';

    let routeParamsBoxHeading = null;
    let routeParamsBoxItem = null;

    /* eslint-disable react/jsx-no-bind */
    const routeParamInputs = objectToArray(
      newRouteParamValues,

      (paramValue, paramName) => (
        <FormItem>
          <Input
            key={paramName}
            label={paramName}
            value={paramValue}
            onChange={this._handleNewRouteParamChange.bind(this, paramName)}
          />
        </FormItem>
      ),
    );
    /* eslint-enable react/jsx-no-bind */

    if (routeParamInputs.length) {
      routeParamsBoxHeading = (
        <BlockContentBoxHeading>
          {getLocalizedText('structure.routeParamValuesHeading')}
        </BlockContentBoxHeading>
      );

      routeParamsBoxItem = (
        <BlockContentBoxItem blank>
          <Form>
            {routeParamInputs}
          </Form>
        </BlockContentBoxItem>
      );
    }

    return (
      <Dialog
        title={dialogTitle}
        buttons={dialogButtons}
        backdrop
        minWidth={400}
        open
        closeOnEscape
        closeOnBackdropClick
        onEnterKeyPress={this._handleEditPathDialogEnterKey}
        onClose={this._handleEditPathDialogClose}
      >
        <BlockContent>
          <BlockContentBox>
            <BlockContentBoxItem blank>
              <Form>
                <FormItem>
                  <Input
                    ref={this._saveRoutePathInputRef}
                    label={getLocalizedText('structure.path')}
                    value={newRoutePath}
                    pattern={ROUTE_PATH_PATTERN}
                    prefix={pathInputPrefix}
                    colorScheme={pathInputStyle}
                    message={pathInputMessage}
                    onChange={this._handleNewRoutePathChange}
                    onPatternError={this._handlePathInputPatternError}
                    onBlur={this._handlePathInputBlur}
                  />
                </FormItem>
              </Form>
            </BlockContentBoxItem>
          </BlockContentBox>

          <BlockContentBox>
            {routeParamsBoxHeading}
            {routeParamsBoxItem}
          </BlockContentBox>
        </BlockContent>
      </Dialog>
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
      <Panel headerFixed maxHeight="initial" spread>
        <PanelContent>
          <Container>
            <Row>
              <Column>
                {routesList}
              </Column>
            </Row>
          </Container>
        </PanelContent>
      </Panel>
    );
  }

  render() {
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
          <Shortcuts
            name="ROUTES_LIST"
            handler={this._handleShortcuts} // eslint-disable-line react/jsx-handler-names
            className="jssy-app"
          >
            {content}
          </Shortcuts>
          
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
