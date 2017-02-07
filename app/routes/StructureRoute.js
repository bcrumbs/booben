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

class StructureRoute extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      confirmDeleteDialogIsVisible: false,
      createRouteDialogIsVisible: false,
      createRouteParentId: -1,
      newRoutePath: '',
      newRouteTitle: '',
    };

    this._newRouteTitleInput = null;

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
    this._handleCreateRouteCancel =
      this._handleCreateRouteCancel.bind(this);
    this._handleCreateRouteCreate =
      this._handleCreateRouteCreate.bind(this);
    this._handleCreateRouteDialogEnterKey =
      this._handleCreateRouteDialogEnterKey.bind(this);
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
   * @param {Object} route
   * @param {boolean} isIndexRoute
   * @private
   */
  _handleRouteSelect({ route, isIndexRoute }) {
    const sameRoute = route
      ? route.id === this.props.selectedRouteId
      : this.props.selectedRouteId === -1;

    const sameIsIndex = route
      ? this.props.indexRouteSelected === isIndexRoute
      : !this.props.indexRouteSelected;

    if (!sameRoute || !sameIsIndex)
      this.props.onSelectRoute(route, isIndexRoute);
  }

  /**
   *
   * @param {Object} route
   * @param {boolean} isIndexRoute
   * @private
   */
  _handleRouteGo({ route, isIndexRoute }) {
    let path = `/${this.props.projectName}/design/${route.id}`;
    if (isIndexRoute) path += '/index';
    history.push(path);
  }

  /**
   *
   * @private
   */
  _handleSelectedRouteGo() {
    this._handleRouteGo({
      route: this.props.selectedRouteId,
      isIndexRoute: this.props.indexRouteSelected,
    });
  }

  /**
   *
   * @private
   */
  _handleDeleteRoutePress() {
    this.setState({
      confirmDeleteDialogIsVisible: true,
    });
  }

  /**
   *
   * @private
   */
  _handleDeleteRouteDialogClose() {
    this.setState({
      confirmDeleteDialogIsVisible: false,
    });
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
    });

    // TODO: Figure out why this._newRouteTitleInput is null
    // this._newRouteTitleInput.focus();
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
    });
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
    const isRootRoute = this.state.createRouteParentId === -1,
      rawPath = this.state.newRoutePath.trim(),
      title = this.state.newRouteTitle.trim();
    
    const path = (isRootRoute && !rawPath.startsWith('/'))
      ? `/${rawPath}`
      : rawPath;

    this.props.onCreateRoute(this.state.createRouteParentId, path, title);
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
    const { getLocalizedText } = this.props;

    let routeCards = routesIds
      ? routesIds.map(routeId => this._renderRouteCard(routes, routeId))
      : null;

    if (parentRoute && parentRoute.haveIndex && !parentRoute.haveRedirect) {
      const isSelected =
        this.props.selectedRouteId === parentRoute.id &&
        this.props.indexRouteSelected;
      
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
      !this.props.indexRouteSelected &&
      this.props.selectedRouteId !== -1 &&
      parentRoute.id === this.props.selectedRouteId
    );
  
    let button = null;
    if (needButton) {
      const text = getLocalizedText(parentRoute ? 'newRoute' : 'newRootRoute');

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
    const route = routes.get(routeId);

    const isSelected =
      this.props.selectedRouteId === route.id &&
      !this.props.indexRouteSelected;
    
    let children = null;
    if (route.children.size > 0 || route.haveIndex) {
      children = this._renderRouteList(routes, route, route.children);
    } else {
      children = isSelected
        ? this._renderRouteList(routes, route, null)
        : null;
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
  
  _getTools() {
    // TODO: Memoize
    
    const { getLocalizedText } = this.props;
    
    const selectedRoute = this.props.selectedRouteId !== -1
      ? this.props.project.routes.get(this.props.selectedRouteId)
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
      title = this.props.indexRouteSelected
        ? `${selectedRoute.title || selectedRoute.path} - Index`
        : selectedRoute.title;
    } else {
      title = getLocalizedText('routeEditorTitle');
    }
  
    const titleEditable = !!selectedRoute && !this.props.indexRouteSelected;
  
    return List([
      List([
        new ToolRecord({
          id: TOOL_ID_ROUTE_EDITOR,
          icon: 'random',
          name: getLocalizedText('routeEditorTitle'),
          title,
          titleEditable,
          titlePlaceholder: getLocalizedText('routeTitle'),
          subtitle: selectedRoute ? selectedRoute.path : '',
          sections: routeEditorToolSections,
          mainButtons: routeEditorToolMainButtons,
          secondaryButtons: routeEditorToolSecondaryButtons,
          windowMinWidth: 360,
        }),
      ]),
    ]);
  }

  render() {
    const { getLocalizedText } = this.props;
  
    const toolGroups = this._getTools();
  
    const routesList = this._renderRouteList(
      this.props.project.routes,
      null,
      this.props.project.rootRoutes,
    );

    const deleteRouteDialogButtons = [{
      text: getLocalizedText('common.delete'),
      onPress: this._handleDeleteRouteConfirm,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleDeleteRouteCancel,
    }];

    const createRouteDialogButtons = [{
      text: getLocalizedText('common.create'),
      disabled: !this.state.newRouteTitle,
      onPress: this._handleCreateRouteCreate,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleCreateRouteCancel,
    }];

    const createRouteDialogTitle = getLocalizedText(
      this.state.createRouteParentId > -1
        ? 'createNewRoute'
        : 'createNewRootRoute',
    );

    return (
      <Desktop
        toolGroups={toolGroups}
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
          title={getLocalizedText('deleteRouteQuestion')}
          buttons={deleteRouteDialogButtons}
          backdrop
          minWidth={400}
          visible={this.state.confirmDeleteDialogIsVisible}
          closeOnEscape
          closeOnBackdropClick
          onEnterKeyPress={this._handleDeleteRouteConfirm}
          onClose={this._handleDeleteRouteDialogClose}
        >
          {getLocalizedText('allChildRoutesWillBeDeletedTooStatement')}
        </Dialog>

        <Dialog
          title={createRouteDialogTitle}
          buttons={createRouteDialogButtons}
          backdrop
          minWidth={400}
          visible={this.state.createRouteDialogIsVisible}
          closeOnEscape
          closeOnBackdropClick
          onEnterKeyPress={this._handleCreateRouteDialogEnterKey}
          onClose={this._handleCreateRouteDialogClose}
        >
          <Form>
            <FormItem>
              <Input
                ref={this._saveNewRouteTitleInputRef}
                label={getLocalizedText('title')}
                value={this.state.newRouteTitle}
                onChange={this._handleNewRouteTitleChange}
              />
            </FormItem>
            <FormItem>
              <Input
                label={getLocalizedText('path')}
                value={this.state.newRoutePath}
                onChange={this._handleNewRoutePathChange}
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
  onSelectRoute: (route, indexRouteSelected) =>
    void dispatch(selectRoute(route ? route.id : -1, indexRouteSelected)),
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
