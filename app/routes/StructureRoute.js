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
   * @param {boolean} [isIndexRoute=false]
   * @private
   */
  _handleRouteSelect(route, isIndexRoute = false) {
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
   * @param {number} routeId
   * @param {boolean} isIndex
   * @private
   */
  _handleRouteGo(routeId, isIndex) {
    let path = `/${this.props.projectName}/design/${routeId}`;
    if (isIndex) path += '/index';
    history.push(path);
  }

  /**
   *
   * @private
   */
  _handleSelectedRouteGo() {
    this._handleRouteGo(
      this.props.selectedRouteId,
      this.props.indexRouteSelected,
    );
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
   * @param {number} parentId
   * @private
   */
  _handleNewRoutePress(parentId) {
    this.setState({
      createRouteDialogIsVisible: true,
      createRouteParentId: parentId,
      newRoutePath: '',
      newRouteTitle: '',
    });

    if (this._newRouteTitleInput) this._newRouteTitleInput.focus();
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
      const onIndexRouteFocus = this._handleRouteSelect.bind(
        this,
        parentRoute,
        true,
      );

      const onIndexRouteGo =
        this._handleRouteGo.bind(this, parentRoute.id, true);

      const isSelected =
        this.props.selectedRouteId === parentRoute.id &&
        this.props.indexRouteSelected;
      
      if (routeCards) {
        routeCards = routeCards.unshift(
          <RouteCard
            key={`${String(parentRoute.id)}-index`}
            title="Index"
            isIndex
            focused={isSelected}
            onFocus={onIndexRouteFocus}
            onGo={onIndexRouteGo}
          />,
        );
      }
    }

    let button = null;
    
    const needButton = parentRoute === null || (
      !this.props.indexRouteSelected &&
      this.props.selectedRouteId !== -1 &&
      parentRoute.id === this.props.selectedRouteId
    );

    if (needButton) {
      const text = getLocalizedText(parentRoute ? 'newRoute' : 'newRootRoute');

      const onPress = this._handleNewRoutePress.bind(
        this,
        parentRoute ? parentRoute.id : -1,
      );

      button = (
        <RouteNewButton text={text} onPress={onPress} />
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
        title={route.title || route.path}
        subtitle={route.path}
        focused={isSelected}
        onFocus={this._handleRouteSelect.bind(this, route, false)}
        onGo={this._handleRouteGo.bind(this, route.id, false)}
      >
        {children}
      </RouteCard>
    );
  }

  render() {
    const { getLocalizedText } = this.props;

    const selectedRoute = this.props.selectedRouteId !== -1
      ? this.props.project.routes.get(this.props.selectedRouteId)
      : null;

    const routeEditorToolMainButtons = selectedRoute
      ? List([
        new ButtonRecord({
          text: getLocalizedText('edit'),
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

    const toolGroups = List([
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

    const routesList = this._renderRouteList(
      this.props.project.routes,
      null,
      this.props.project.rootRoutes,
    );

    const deleteRouteDialogButtons = [{
      text: getLocalizedText('delete'),
      onPress: this._handleDeleteRouteConfirm,
    }, {
      text: getLocalizedText('cancel'),
      onPress: this._handleDeleteRouteCancel,
    }];

    const createRouteDialogButtons = [{
      text: getLocalizedText('create'),
      disabled: !this.state.newRouteTitle,
      onPress: this._handleCreateRouteCreate,
    }, {
      text: getLocalizedText('cancel'),
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

StructureRoute.propTypes = {
  project: PropTypes.instanceOf(ProjectRecord).isRequired,
  projectName: PropTypes.string.isRequired,
  selectedRouteId: PropTypes.number.isRequired,
  indexRouteSelected: PropTypes.bool.isRequired,

  getLocalizedText: PropTypes.func.isRequired,
  onSelectRoute: PropTypes.func.isRequired,
  onCreateRoute: PropTypes.func.isRequired,
  onDeleteRoute: PropTypes.func.isRequired,
  onRenameRoute: PropTypes.func.isRequired,
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
