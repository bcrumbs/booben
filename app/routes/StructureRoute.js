/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// TODO: Get all text from i18n

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';
import { RouteEditor } from '../containers/RouteEditor/RouteEditor';

import ProjectRecord from '../models/Project';
import ProjectRouteRecord from '../models/ProjectRoute';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';

import {
    createRoute,
    deleteRoute,
    updateRouteField
} from '../actions/project';

import { selectRoute } from '../actions/structure';

import {
    Panel,
    PanelContent,
    Container,
    Row,
    Column,
    Dialog,
    Input,
    Form
} from '@reactackle/reactackle';

import {
    RoutesList,
    RouteCard,
    RouteNewButton
} from '../components/RoutesList/RoutesList';

import { List } from 'immutable';

import history from '../history';

import {
    getRouteByIndexes,
    getRoutesByIndexes
} from '../utils';

const  LEFT_ARROW = 37,
    UP_ARROW = 38,
    RIGHT_ARROW = 39,
    DOWN_ARROW = 40,
    DELETE_KEY = 46,
    N_KEY = 78,
    R_KEY = 82;

const TOOL_ID_ROUTE_EDITOR = 'routeEditor';

export const STRUCTURE_TOOL_IDS = List([TOOL_ID_ROUTE_EDITOR]);

class StructureRoute extends Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmDeleteDialogIsVisible: false,
            createRouteDialogIsVisible: false,
            createRouteIndexes: List(),
            newRoutePath: '',
            newRouteTitle: ''
        };

        this._newRouteTitleInput = null;

        this._saveNewRouteTitleInputRef = this._saveNewRouteTitleInputRef.bind(this);

        this._handleKeyUp = this._handleKeyUp.bind(this);
        this._handleSelectedRouteGo = this._handleSelectedRouteGo.bind(this);
        this._handleToolTitleChange = this._handleToolTitleChange.bind(this);

        this._handleDeleteRoutePress = this._handleDeleteRoutePress.bind(this);
        this._handleDeleteRouteDialogClose = this._handleDeleteRouteDialogClose.bind(this);
        this._handleDeleteRouteConfirm = this._handleDeleteRouteConfirm.bind(this);
        this._handleDeleteRouteCancel = this._handleDeleteRouteCancel.bind(this);

        this._handleCreateRouteDialogClose = this._handleCreateRouteDialogClose.bind(this);
        this._handleNewRouteTitleChange = this._handleNewRouteTitleChange.bind(this);
        this._handleNewRoutePathChange = this._handleNewRoutePathChange.bind(this);
        this._handleCreateRouteCancel = this._handleCreateRouteCancel.bind(this);
        this._handleCreateRouteCreate = this._handleCreateRouteCreate.bind(this);
        this._handleCreateRouteDialogEnterKey = this._handleCreateRouteDialogEnterKey.bind(this);

        this._renderRouteList = this._renderRouteList.bind(this);
        this._renderRouteCard = this._renderRouteCard.bind(this);
    }

    componentDidMount() {
        if (this.props.selectedRouteId === -1) this._selectFirstRoute();
    }

    _handleKeyUp(event) {
        // TODO: Use this somewhere

        if (event.keyCode === DOWN_ARROW) {
            event.preventDefault();
            this._selectNextRoute();
        }
        else if (event.keyCode === UP_ARROW) {
            event.preventDefault();
            this._selectPrevRoute();
        }
        else if (event.keyCode === RIGHT_ARROW) {
            event.preventDefault();
            this._selectChildRoute();
        }
        else if (event.keyCode === LEFT_ARROW) {
            event.preventDefault();
            this._selectParentRoute();
        }
        else if (event.keyCode === DELETE_KEY) {
            event.preventDefault();
            this._handleDeleteRoutePress();
        }
        else if (event.keyCode === N_KEY) {
            event.preventDefault();

            if (this.props.selectedRouteId > -1)
                this._handleNewRoutePress(this.props.selectedRouteIndexes);
        }
        else if (event.keyCode === R_KEY) {
            event.preventDefault();
            this._handleNewRoutePress(List());
        }
    }

    _saveNewRouteTitleInputRef(ref) {
        this._newRouteTitleInput = ref;
    }

    _selectFirstRoute() {
        if (this.props.project.routes.size > 0) {
            this._handleRouteSelect(this.props.project.routes.get(0), List([0]));
        }
        else {
            this._handleRouteSelect(null, null);
        }
    }

    _selectNextRoute() {
        const where = this.props.selectedRouteIndexes.butLast(),
            idx = this.props.selectedRouteIndexes.last(),
            routes = getRoutesByIndexes(this.props.project.routes, where),
            nextIdx = idx + 1;

        if (nextIdx < routes.size)
            this._handleRouteSelect(routes.get(nextIdx), where.push(nextIdx));
    }

    _selectPrevRoute() {
        const where = this.props.selectedRouteIndexes.butLast(),
            idx = this.props.selectedRouteIndexes.last(),
            routes = getRoutesByIndexes(this.props.project.routes, where),
            prevIdx = idx - 1;

        if (prevIdx >= 0)
            this._handleRouteSelect(routes.get(prevIdx), where.push(prevIdx));
    }

    _selectChildRoute() {
        const where = this.props.selectedRouteIndexes.butLast(),
            idx = this.props.selectedRouteIndexes.last(),
            route = getRouteByIndexes(this.props.project.routes, where, idx);

        if (route.children.size > 0) {
            this._handleRouteSelect(
                route.children.get(0),
                this.props.selectedRouteIndexes.push(0)
            );
        }
    }

    _selectParentRoute() {
        if (this.props.selectedRouteIndexes.size > 1) {
            const nextIndexes = this.props.selectedRouteIndexes.pop(),
                where = nextIndexes.butLast(),
                idx = nextIndexes.last(),
                route = getRouteByIndexes(this.props.project.routes, where, idx);

            this._handleRouteSelect(route, nextIndexes);
        }
    }

    _handleRouteSelect(route, indexes, isIndexRoute) {
        const sameRoute = route
            ? route.id === this.props.selectedRouteId
            : !route;

        const sameIndexes = this.props.selectedRouteIndexes === indexes;

        if (!sameRoute || !sameIndexes)
            this.props.onSelectRoute(route, indexes, isIndexRoute);
    }

    _handleRouteGo(routeId, isIndex) {
        let path = `/${this.props.projectName}/design/${routeId}`;
        if (isIndex) path += '/index';
        history.push(path);
    }

    _handleSelectedRouteGo() {
        this._handleRouteGo(this.props.selectedRouteId, this.props.indexRouteSelected);
    }

    _handleDeleteRoutePress() {
        this.setState({
            confirmDeleteDialogIsVisible: true
        });
    }

    _handleDeleteRouteDialogClose() {
        this.setState({
            confirmDeleteDialogIsVisible: false
        });
    }

    _handleDeleteRouteConfirm(closeDialog) {
        const where = this.props.selectedRouteIndexes.butLast(),
            idx = this.props.selectedRouteIndexes.last();

        this.props.onDeleteRoute(where, idx);
        this._selectFirstRoute();
        closeDialog();
    }

    _handleDeleteRouteCancel(closeDialog) {
        closeDialog();
    }

    _handleNewRoutePress(indexes) {
        this.setState({
            createRouteDialogIsVisible: true,
            createRouteIndexes: indexes,
            newRoutePath: '',
            newRouteTitle: ''
        });

        if (this._newRouteTitleInput) {
            // Not-so-ugly hack
            const el = ReactDOM.findDOMNode(this._newRouteTitleInput);
            if (el) {
                const input = el.getElementsByTagName('input')[0];
                if (input) input.focus();
            }
        }
    }

    _handleCreateRouteDialogClose() {
        this.setState({
            createRouteDialogIsVisible: false,
            createRouteIndexes: List()
        });
    }

    _handleNewRoutePathChange(newPath) {
        this.setState({
            newRoutePath: newPath
        });
    }

    _handleNewRouteTitleChange(newTitle) {
        this.setState({
            newRouteTitle: newTitle
        });
    }

    _handleCreateRouteCancel(closeDialog) {
        closeDialog();
    }

    _handleCreateRouteCreate(closeDialog) {
        const isRootRoute = this.state.createRouteIndexes.size === 0,
            rawPath = this.state.newRoutePath.trim(),
            path = (isRootRoute && !rawPath.startsWith('/')) ? `/${rawPath}` : rawPath,
            title = this.state.newRouteTitle.trim();

        this.props.onCreateRoute(this.state.createRouteIndexes, path, title);
        closeDialog();
    }

    _handleCreateRouteDialogEnterKey(closeDialog) {
        if (this.state.newRouteTitle) this._handleCreateRouteCreate(closeDialog);
    }

    _handleToolTitleChange(tool, newTitle) {
        if (tool.id === TOOL_ID_ROUTE_EDITOR) {
            const where = this.props.selectedRouteIndexes.butLast(),
                idx = this.props.selectedRouteIndexes.last();

            this.props.onRenameRoute(where, idx, newTitle);
        }
    }

    _renderRouteList(parentRoute, routes, indexes) {
        let routeCards = routes
            ? routes.map((route, idx) => this._renderRouteCard(route, indexes.push(idx)))
            : null;

        if (parentRoute && parentRoute.haveIndex && !parentRoute.haveRedirect) {
            const onIndexRouteFocus = this._handleRouteSelect.bind(
                this,
                parentRoute,
                indexes,
                true
            );

            const onIndexRouteGo = this._handleRouteGo.bind(this, parentRoute.id, true);

            const isSelected =
                this.props.selectedRouteId === parentRoute.id &&
                this.props.indexRouteSelected;

            routeCards = routeCards && routeCards.unshift(
                <RouteCard
                    key={String(parentRoute.id) + '-index'}
                    title="Index"
                    isIndex
                    focused={isSelected}
                    onFocus={onIndexRouteFocus}
                    onGo={onIndexRouteGo}
                />
            );
        }

        let button = null;

        //noinspection JSValidateTypes
        const needButton = parentRoute === null || (
            !this.props.indexRouteSelected &&
            this.props.selectedRouteId !== -1 &&
            parentRoute.id === this.props.selectedRouteId
        );

        if (needButton) {
            button = (
                <RouteNewButton
                    text={parentRoute ? 'New route' : 'New root route'}
                    onPress={this._handleNewRoutePress.bind(this, indexes)}
                />
            );
        }

        return (
            <RoutesList>
                {routeCards}
                {button}
            </RoutesList>
        );
    }

    _renderRouteCard(route, indexes) {
        const isSelected =
            this.props.selectedRouteId === route.id &&
            !this.props.indexRouteSelected;

        const children = route.children.size > 0 || route.haveIndex
            ? this._renderRouteList(route, route.children, indexes)
            : isSelected
                ? this._renderRouteList(route, null, indexes)
                : null;

        return (
            <RouteCard
                key={String(route.id)}
                title={route.title || route.path}
                subtitle={route.path}
                focused={isSelected}
                onFocus={this._handleRouteSelect.bind(this, route, indexes, false)}
                onGo={this._handleRouteGo.bind(this, route.id, false)}
            >
                {children}
            </RouteCard>
        );
    }

    render() {
        let selectedRoute = null;
        if (this.props.selectedRouteId !== -1) {
            const routeIndexEntry =
                this.props.routesIndex.get(this.props.selectedRouteId);

            selectedRoute = this.props.project.getIn(routeIndexEntry.path);
        }

        const routeEditorToolMainButtons = selectedRoute
            ? List([
                new ButtonRecord({
                    text: 'Edit',
                    onPress: this._handleSelectedRouteGo
                }),

                new ButtonRecord({
                    text: 'Delete',
                    onPress: this._handleDeleteRoutePress
                })
            ])
            : List();

        const routeEditorToolSections = List([
            new ToolSectionRecord({
                component: RouteEditor
            })
        ]);

        const title = selectedRoute
            ? this.props.indexRouteSelected
                ? `${selectedRoute.title || selectedRoute.path} - Index`
                : selectedRoute.title
            : '';

        const titleEditable = !!selectedRoute && !this.props.indexRouteSelected;

        const toolGroups = List([
            List([
                new ToolRecord({
                    id: TOOL_ID_ROUTE_EDITOR,
                    icon: 'random',
                    name: 'Route',
                    title: title,
                    titleEditable: titleEditable,
                    titlePlaceholder: 'Route title',
                    subtitle: selectedRoute ? selectedRoute.path : '',
                    sections: routeEditorToolSections,
                    mainButtons: routeEditorToolMainButtons,
                    windowMinWidth: 360
                })
            ])
        ]);

        const routesList = this._renderRouteList(null, this.props.project.routes, List());

        const deleteRouteDialogButtons = [
            { text: 'Delete', onPress: this._handleDeleteRouteConfirm },
            { text: 'Cancel', onPress: this._handleDeleteRouteCancel }
        ];

        const createRouteDialogButtons = [
            {
                text: 'Create',
                disabled: !this.state.newRouteTitle,
                onPress: this._handleCreateRouteCreate
            },
            {
                text: 'Cancel',
                onPress: this._handleCreateRouteCancel
            }
        ];

        const createRouteDialogTitle = this.state.createRouteIndexes.size > 0
            ? 'Create new route'
            : 'Create new root route';

        return (
            <Desktop
                toolGroups={toolGroups}
                onToolTitleChange={this._handleToolTitleChange}
            >
                <Panel headerFixed maxHeight="initial">
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
                    title="Delete route?"
                    buttons={deleteRouteDialogButtons}
                    backdrop
                    minWidth={400}
                    visible={this.state.confirmDeleteDialogIsVisible}
                    onEnterKeyPress={this._handleDeleteRouteConfirm}
                    onClose={this._handleDeleteRouteDialogClose}
                >
                    All child routes will be deleted too.
                </Dialog>

                <Dialog
                    title={createRouteDialogTitle}
                    buttons={createRouteDialogButtons}
                    backdrop
                    minWidth={400}
                    visible={this.state.createRouteDialogIsVisible}
                    onEnterKeyPress={this._handleCreateRouteDialogEnterKey}
                    onClose={this._handleCreateRouteDialogClose}
                >
                    <Form>
                        <Input
                            ref={this._saveNewRouteTitleInputRef}
                            label="Title"
                            value={this.state.newRouteTitle}
                            onChange={this._handleNewRouteTitleChange}
                        />

                        <Input
                            label="Path"
                            value={this.state.newRoutePath}
                            onChange={this._handleNewRoutePathChange}
                        />
                    </Form>
                </Dialog>
            </Desktop>
        );
    }
}

StructureRoute.propTypes = {
    project: PropTypes.instanceOf(ProjectRecord),
    projectName: PropTypes.string,
    routesIndex: ImmutablePropTypes.map,
    selectedRouteId: PropTypes.number,
    selectedRouteIndexes: ImmutablePropTypes.listOf(
        PropTypes.number
    ),
    indexRouteSelected: PropTypes.bool,

    onSelectRoute: PropTypes.func,
    onCreateRoute: PropTypes.func,
    onDeleteRoute: PropTypes.func,
    onRenameRoute: PropTypes.func
};

StructureRoute.displayName = 'StructureRoute';

const mapStateToProps = state => ({
    project: state.project.data,
    projectName: state.project.projectName,
    routesIndex: state.project.routesIndex,
    selectedRouteId: state.structure.selectedRouteId,
    selectedRouteIndexes: state.structure.selectedRouteIndexes,
    indexRouteSelected: state.structure.indexRouteSelected
});

const mapDispatchToProps = dispatch => ({
    onSelectRoute: (route, indexes, indexRouteSelected) =>
        void dispatch(selectRoute(
            route ? route.id : -1,
            indexes || List(),
            indexRouteSelected
        )),

    onCreateRoute: (where, path, title) =>
        void dispatch(createRoute(where, path, title)),

    onDeleteRoute: (where, idx) =>
        void dispatch(deleteRoute(where, idx)),

    onRenameRoute: (where, idx, newTitle) =>
        void dispatch(updateRouteField(where, idx, 'title', newTitle))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StructureRoute);
