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

import ProjectRouteRecord from '../models/ProjectRoute';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';

import {
    createRoute,
    deleteRoute,
    renameRoute
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
    findRouteById,
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

const routeEditorToolId = 'routeEditor';

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

        this._renderRouteList = this._renderRouteList.bind(this);
        this._renderRouteCard = this._renderRouteCard.bind(this);

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

        this._handleToolTitleChange = this._handleToolTitleChange.bind(this);
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
        if (this.props.routes.size > 0) {
            this._handleRouteSelect(this.props.routes.get(0), List([0]));
        }
        else {
            this._handleRouteSelect(null, null);
        }
    }

    _selectNextRoute() {
        const where = this.props.selectedRouteIndexes.butLast(),
            idx = this.props.selectedRouteIndexes.last(),
            routes = getRoutesByIndexes(this.props.routes, where),
            nextIdx = idx + 1;

        if (nextIdx < routes.size)
            this._handleRouteSelect(routes.get(nextIdx), where.push(nextIdx));
    }

    _selectPrevRoute() {
        const where = this.props.selectedRouteIndexes.butLast(),
            idx = this.props.selectedRouteIndexes.last(),
            routes = getRoutesByIndexes(this.props.routes, where),
            prevIdx = idx - 1;

        if (prevIdx >= 0)
            this._handleRouteSelect(routes.get(prevIdx), where.push(prevIdx));
    }

    _selectChildRoute() {
        const where = this.props.selectedRouteIndexes.butLast(),
            idx = this.props.selectedRouteIndexes.last(),
            route = getRouteByIndexes(this.props.routes, where, idx);

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
                route = getRouteByIndexes(this.props.routes, where, idx);

            this._handleRouteSelect(route, nextIndexes);
        }
    }

    _handleRouteSelect(route, indexes) {
        const sameRoute = route
            ? route.id === this.props.selectedRouteId
            : !route;

        const sameIndexes = this.props.selectedRouteIndexes === indexes;

        if (!sameRoute || !sameIndexes)
            this.props.onSelectRoute(route, indexes);
    }

    _handleRouteGo(route) {
        history.push(`/${this.props.projectName}/design/${route.id}`);
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
        console.log(newTitle);

        if (tool.id === routeEditorToolId) {
            const where = this.props.selectedRouteIndexes.butLast(),
                idx = this.props.selectedRouteIndexes.last();

            this.props.onRenameRoute(where, idx, newTitle);
        }
    }

    _renderRouteList(parentRoute, routes, indexes) {
        const routeCards = routes
            ? routes.map((route, idx) => this._renderRouteCard(route, indexes.push(idx)))
            : null;

        let button = null;

        //noinspection JSValidateTypes
        const needButton = parentRoute === null || (
            !parentRoute.isIndex &&
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
        const isSelected = this.props.selectedRouteId === route.id;

        const children = route.children.size > 0
            ? this._renderRouteList(route, route.children, indexes)
            : isSelected
                ? this._renderRouteList(route, null, indexes)
                : null;

        const title = route.title || (route.isIndex ? 'Index' : route.path),
            subtitle = route.isIndex ? '' : route.path;

        return (
            <RouteCard
                key={route.id}
                title={title}
                subtitle={subtitle}
                home={route.isIndex}
                focused={isSelected}
                onFocus={this._handleRouteSelect.bind(this, route, indexes)}
                onGo={this._handleRouteGo.bind(this, route)}
            >
                {children}
            </RouteCard>
        );
    }

    render() {
        //noinspection JSValidateTypes
        const selectedRoute = this.props.selectedRouteId !== -1
            ? findRouteById(this.props.routes, this.props.selectedRouteId)
            : null;

        const routeEditorToolMainButtons = selectedRoute
            ? List([
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

        const toolGroups = List([
            List([
                new ToolRecord({
                    id: routeEditorToolId,
                    icon: 'random',
                    name: 'Route',
                    title: selectedRoute ? selectedRoute.title : '',
                    titleEditable: true,
                    titlePlaceholder: 'Route title',
                    subtitle: selectedRoute
                        ? selectedRoute.isIndex
                            ? 'Index route'
                            : selectedRoute.path
                        : '',
                    sections: routeEditorToolSections,
                    mainButtons: routeEditorToolMainButtons,
                    windowMinWidth: 360
                })
            ])
        ]);

        const routesList = this._renderRouteList(null, this.props.routes, List());

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
            <Desktop toolGroups={toolGroups} onToolTitleChange={this._handleToolTitleChange}>
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
    routes: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(ProjectRouteRecord)
    ),

    projectName: PropTypes.string,
    selectedRouteId: PropTypes.number,
    selectedRouteIndexes: ImmutablePropTypes.listOf(
        PropTypes.number
    ),

    onSelectRoute: PropTypes.func,
    onCreateRoute: PropTypes.func,
    onDeleteRoute: PropTypes.func,
    onRenameRoute: PropTypes.func
};

StructureRoute.displayName = 'StructureRoute';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    projectName: state.project.projectName,
    selectedRouteId: state.structure.selectedRouteId,
    selectedRouteIndexes: state.structure.selectedRouteIndexes
});

const mapDispatchToProps = dispatch => ({
    onSelectRoute: (route, indexes) =>
        void dispatch(selectRoute(route ? route.id : -1, indexes || List())),

    onCreateRoute: (where, path, title) =>
        void dispatch(createRoute(where, path, title)),

    onDeleteRoute: (where, idx) =>
        void dispatch(deleteRoute(where, idx)),

    onRenameRoute: (where, idx, newTitle) =>
        void dispatch(renameRoute(where, idx, newTitle))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StructureRoute);
