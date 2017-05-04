/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { List } from 'immutable';

import {
  Panel,
  PanelContent,
  Header,
  HeaderRegion,
  HeaderTitle,
  Container,
  Row,
  Column,
  Dialog,
  Input,
} from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '../components/BlockContent/BlockContent';

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
} from '../actions/project';

import { selectRoute } from '../actions/structure';
import { getLocalizedTextFromState } from '../selectors';

import {
  arrayToObject,
  objectToArray,
  objectSome,
  returnArg,
  isUndef,
} from '../utils/misc';

import { TOOL_ID_ROUTE_EDITOR } from '../constants/toolIds';

import {
  buildDesignRoutePath,
  buildDesignRouteIndexPath,
} from '../constants/paths';

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
  onOpenDesigner: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {
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
  
  onOpenDesigner: ({ projectName, routeId, isIndexRoute }) => {
    const path = isIndexRoute
      ? buildDesignRouteIndexPath({ projectName, routeId })
      : buildDesignRoutePath({ projectName, routeId });
    
    dispatch(push(path));
  },
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

/**
 *
 * @type {RegExp}
 */
const ROUTE_PATH_PATTERN = /^[a-zA-Z0-9\-_/:]+$/;

class StructureRoute extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      confirmDeleteDialogIsVisible: false,
      createRouteDialogIsVisible: false,
      createRouteParentId: -1,
      newRoutePath: '',
      newRouteTitle: '',
      newRouteParamValues: {},
      pathPatternError: false,
    };

    this._handleRouteSelect =
      this._handleRouteSelect.bind(this);
    this._handleRouteGo =
      this._handleRouteGo.bind(this);
    this._handleNewRoutePress =
      this._handleNewRoutePress.bind(this);
    this._saveNewRouteTitleInputRef =
      this._saveNewRouteTitleInputRef.bind(this);
    this._handleSelectedRouteGo =
      this._handleSelectedRouteGo.bind(this);
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
  
    this._newRouteTitleInput = null;
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
  
  _isRouteAlreadyExist() {
    const { project } = this.props;
    const { createRouteParentId, newRoutePath } = this.state;
    
    const creatingRootRoute = createRouteParentId === -1;
    
    if (creatingRootRoute) {
      const siblingIds = project.rootRoutes;
      const actualNewRoutePath = `/${newRoutePath}`;
      
      const haveExistingRootRoutes = siblingIds.some(
        routeId => project.routes.get(routeId).path === actualNewRoutePath,
      );
      
      if (haveExistingRootRoutes) return true;
      
      const slashRouteId = project.rootRoutes.find(
        routeId => project.routes.get(routeId).path === '/',
      );
      
      if (isUndef(slashRouteId)) return false;
      
      return project.routes.get(slashRouteId).children.some(
        routeId => project.routes.get(routeId).path === newRoutePath,
      );
    } else {
      const siblingIds = project.routes.get(createRouteParentId).children;
      
      return siblingIds.some(
        routeId => project.routes.get(routeId).path === newRoutePath,
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
   * @param {number} routeId
   * @param {boolean} isIndexRoute
   * @private
   */
  _handleRouteSelect({ routeId, isIndexRoute }) {
    const { selectedRouteId, indexRouteSelected, onSelectRoute } = this.props;

    if (
      routeId !== selectedRouteId ||
      isIndexRoute !== indexRouteSelected
    ) onSelectRoute(routeId, isIndexRoute);
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
    }, () => {
      this._newRouteTitleInput.focus();
    });
  }

  /**
   *
   * @private
   */
  _handleCreateRouteDialogClose() {
    this.setState({
      createRouteDialogIsVisible: false,
      createRouteParentId: -1,
    });
  }

  /**
   *
   * @param {string} value
   * @private
   */
  _handleNewRoutePathChange({ value }) {
    const { newRouteParamValues } = this.state;
    
    const params = value
      .split('/')
      .filter(part => part.length > 1 && part.startsWith(':'))
      .map(part => part.slice(1));
    
    const newParamValues = arrayToObject(
      params,
      returnArg,
      paramName => newRouteParamValues[paramName] || '',
    );
    
    this.setState({
      newRoutePath: value,
      pathPatternError: false,
      newRouteParamValues: newParamValues,
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
    const path = (isRootRoute && !rawPath.startsWith('/'))
      ? `/${rawPath}`
      : rawPath;

    onCreateRoute(createRouteParentId, path, title, newRouteParamValues);
    closeDialog();
  }

  /**
   *
   * @param {Function} closeDialog
   * @private
   */
  _handleCreateRouteDialogEnterKey(closeDialog) {
    if (this.state.newRouteTitle) this._handleCreateRouteCreate(closeDialog);
  }

  /**
   *
   * @param {Object} tool
   * @param {string} newTitle
   * @private
   */
  _handleToolTitleChange(tool, newTitle) {
    if (tool.id === TOOL_ID_ROUTE_EDITOR)
      this.props.onRenameRoute(this.props.selectedRouteId, newTitle);
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
            route={parentRoute}
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
    if (willRenderChildren)
      children = this._renderRouteList(routes, route, route.children);
    else
      children = isSelected ? this._renderRouteList(routes, route, null) : null;

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
    const routeAlreadyExists = this._isRouteAlreadyExist();
    const isCreateButtonDisabled =
      !newRouteTitle ||
      routeAlreadyExists ||
      (!creatingRootRoute && !newRoutePath) ||
      objectSome(newRouteParamValues, value => !value);
    
    const createRouteDialogButtons = [{
      text: getLocalizedText('common.create'),
      disabled: isCreateButtonDisabled,
      onPress: this._handleCreateRouteCreate,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleCreateRouteCancel,
    }];
  
    const createRouteDialogTitle = getLocalizedText(
      creatingRootRoute
        ? 'structure.createNewRootRoute'
        : 'structure.createNewRoute',
    );
  
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
        <Input
          key={paramName}
          label={paramName}
          value={paramValue}
          onChange={this._handleNewRouteParamChange.bind(this, paramName)}
        />
      ),
    );
    /* eslint-enable react/jsx-no-bind */
    
    if (routeParamInputs.length) {
      routeParamsBoxHeading = (
        <BlockContentBoxHeading>
          Provide example values for route parameters
        </BlockContentBoxHeading>
      );
  
      routeParamsBoxItem = (
        <BlockContentBoxItem blank>
          {routeParamInputs}
        </BlockContentBoxItem>
      );
    }
    
    return (
      <Dialog
        title={createRouteDialogTitle}
        buttons={createRouteDialogButtons}
        backdrop
        minWidth={400}
        visible={createRouteDialogIsVisible}
        closeOnEscape
        closeOnBackdropClick
        onEnterKeyPress={this._handleCreateRouteDialogEnterKey}
        onClose={this._handleCreateRouteDialogClose}
      >
        <BlockContent>
          <BlockContentBox>
            <BlockContentBoxItem blank>
              <Input
                ref={this._saveNewRouteTitleInputRef}
                label={getLocalizedText('structure.title')}
                value={newRouteTitle}
                onChange={this._handleNewRouteTitleChange}
              />
          
              <Input
                label={getLocalizedText('structure.path')}
                value={newRoutePath}
                pattern={ROUTE_PATH_PATTERN}
                prefix={pathInputPrefix}
                styleMode={pathInputStyle}
                message={pathInputMessage}
                onChange={this._handleNewRoutePathChange}
                onPatternError={this._handlePathInputPatternError}
                onBlur={this._handlePathInputBlur}
              />
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
        visible={confirmDeleteDialogIsVisible}
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
    const { project, getLocalizedText } = this.props;
  
    const routesList =
      this._renderRouteList(project.routes, null, project.rootRoutes);
    
    return (
      <Panel headerFixed maxHeight="initial" spread>
        <Header>
          <HeaderRegion spread alignY="center">
            <HeaderTitle>
              {getLocalizedText('appHeader.menu.structure')}
            </HeaderTitle>
          </HeaderRegion>
        </Header>
    
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
    const deleteRouteDialog = this._renderDeleteRouteDialog();

    return (
      <Desktop
        toolGroups={this._toolGroups}
        onToolTitleChange={this._handleToolTitleChange}
      >
        {content}
        {newRouteDialog}
        {deleteRouteDialog}
      </Desktop>
    );
  }
}

StructureRoute.propTypes = propTypes;
StructureRoute.defaultProps = defaultProps;
StructureRoute.displayName = 'StructureRoute';

export default wrap(StructureRoute);
