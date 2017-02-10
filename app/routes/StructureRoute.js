/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';

import {
  Panel,
  PanelContent,
  Container,
  Row,
  Column,
  Dialog,
  Input,
  Form,
  FormItem,
} from '@reactackle/reactackle';

import {
  RoutesList,
  RouteCard,
  IndexRouteCard,
  RouteNewButton,
} from '../components/RoutesList/RoutesList';

import { HeaderRoute } from '../components/HeaderRoute/HeaderRoute';
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
import history from '../history';
import { getLocalizedTextFromState } from '../utils';
import { noop, returnArg } from '../utils/misc';

/**
 *
 * @type {string}
 */
const TOOL_ID_ROUTE_EDITOR = 'routeEditor';

/**
 *
 * @type {Immutable.List<string>}
 */
export const STRUCTURE_TOOL_IDS = List([TOOL_ID_ROUTE_EDITOR]);

/**
 *
 * @type {RegExp}
 */
const ROUTE_PATH_PATTERN = /^[a-zA-Z0-9\-_]+$/;

class StructureRoute extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      confirmDeleteDialogIsVisible: false,
      createRouteDialogIsVisible: false,
      createRouteParentId: -1,
      newRoutePath: '',
      newRouteTitle: '',
      pathPatternError: false,
    };

    this._newRouteTitleInput = null;
    this._toolGroups = this._getTools(
      props.project,
      props.selectedRouteId,
      props.indexRouteSelected,
      props.getLocalizedText,
    );

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
      
      if (typeof slashRouteId === 'undefined') return false;
      
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
    const { projectName } = this.props;
    
    const path =
      `/${projectName}/design/${routeId}${isIndexRoute ? '/index' : ''}`;
    
    history.push(path);
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
   * @param {string} newPath
   * @private
   */
  _handleNewRoutePathChange(newPath) {
    this.setState({
      newRoutePath: newPath,
      pathPatternError: false,
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
   * @param {string} newTitle
   * @private
   */
  _handleNewRouteTitleChange(newTitle) {
    this.setState({
      newRouteTitle: newTitle,
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
    const { createRouteParentId, newRoutePath, newRouteTitle } = this.state;
    
    const isRootRoute = createRouteParentId === -1;
    const rawPath = newRoutePath.trim();
    const title = newRouteTitle.trim();
    const path = (isRootRoute && !rawPath.startsWith('/'))
      ? `/${rawPath}`
      : rawPath;

    onCreateRoute(createRouteParentId, path, title);
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

    if (parentRoute && parentRoute.haveIndex && !parentRoute.haveRedirect) {
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

  render() {
    const { project, getLocalizedText } = this.props;
    const {
      createRouteParentId,
      newRouteTitle,
      newRoutePath,
      confirmDeleteDialogIsVisible,
      createRouteDialogIsVisible,
      pathPatternError,
    } = this.state;
    
    const routesList = this._renderRouteList(
      project.routes,
      null,
      project.rootRoutes,
    );

    const deleteRouteDialogButtons = [{
      text: getLocalizedText('common.delete'),
      onPress: this._handleDeleteRouteConfirm,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleDeleteRouteCancel,
    }];
  
    const creatingRootRoute = createRouteParentId === -1;
    const routeAlreadyExists = this._isRouteAlreadyExist();
    const isCreateButtonDisabled =
      !newRouteTitle ||
      routeAlreadyExists ||
      (!creatingRootRoute && !newRoutePath);
    
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

    return (
      <Desktop
        toolGroups={this._toolGroups}
        onToolTitleChange={this._handleToolTitleChange}
      >
        <Panel headerFixed maxHeight="initial" spread>
          <HeaderRoute title={getLocalizedText('structure')} />

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
                styleMode={pathInputStyle}
                message={pathInputMessage}
                onChange={this._handleNewRoutePathChange}
                onPatternError={this._handlePathInputPatternError}
                onBlur={this._handlePathInputBlur}
              />
            </FormItem>
          </Form>
        </Dialog>
      </Desktop>
    );
  }
}

//noinspection JSUnresolvedVariable
StructureRoute.propTypes = {
  project: PropTypes.instanceOf(ProjectRecord).isRequired,
  projectName: PropTypes.string,
  selectedRouteId: PropTypes.number,
  indexRouteSelected: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onSelectRoute: PropTypes.func,
  onCreateRoute: PropTypes.func,
  onDeleteRoute: PropTypes.func,
  onRenameRoute: PropTypes.func,
};

StructureRoute.defaultProps = {
  projectName: '',
  selectedRouteId: -1,
  indexRouteSelected: false,
  getLocalizedText: returnArg,
  onSelectRoute: noop,
  onCreateRoute: noop,
  onDeleteRoute: noop,
  onRenameRoute: noop,
};

StructureRoute.displayName = 'StructureRoute';

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
  onCreateRoute: (parentRouteId, path, title) =>
    void dispatch(createRoute(parentRouteId, path, title)),
  onDeleteRoute: routeId =>
    void dispatch(deleteRoute(routeId)),
  onRenameRoute: (routeId, newTitle) =>
    void dispatch(updateRouteField(routeId, 'title', newTitle)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(StructureRoute);
