/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// TODO: Get all text from i18n

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';
import { RouteEditor } from '../containers/RouteEditor/RouteEditor';

import { Dialog } from '@reactackle/reactackle';

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
    Column
} from '@reactackle/reactackle';

import {
    RoutesList,
    RouteCard,
    RouteNewButton
} from '../components/RoutesList/RoutesList';

import { List } from 'immutable';

import history from '../history';

import { findRouteById } from '../utils';

class StructureRoute extends Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmDeleteDialogIsVisible: false
        };

        this._renderRouteList = this._renderRouteList.bind(this);
        this._renderRouteCard = this._renderRouteCard.bind(this);
        this._handleDeleteRoutePress = this._handleDeleteRoutePress.bind(this);
        this._handleDeleteRouteDialogClose = this._handleDeleteRouteDialogClose.bind(this);
        this._handleDeleteRouteConfirm = this._handleDeleteRouteConfirm.bind(this);
        this._handleDeleteRouteCancel = this._handleDeleteRouteCancel.bind(this);
    }

    componentDidMount() {
        if (this.props.selectedRouteId === -1) this._selectFirstRoute();
    }

    _selectFirstRoute() {
        if (this.props.routes.size > 0) {
            this._handleRouteSelect(this.props.routes.get(0), List([0]));
        }
        else {
            this._handleRouteSelect(null, null);
        }
    }

    _handleRouteSelect(route, indexes) {
        this.props.onSelectRoute(route, indexes);
    }

    _handleRouteGo(route) {
        history.push(`/${this.props.projectName}/design/${route.id}`);
    }

    _handleNewRoutePress(indexes) {

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

        const toolMainButtons = selectedRoute
            ? List([
                new ButtonRecord({
                    text: 'Delete',
                    onPress: this._handleDeleteRoutePress
                })
            ])
            : List();

        const toolSections = List([
            new ToolSectionRecord({
                component: RouteEditor
            })
        ]);

        const toolGroups = List([
            List([
                new ToolRecord({
                    id: 'routeEditor',
                    icon: 'random',
                    name: 'Route',
                    title: selectedRoute ? selectedRoute.title : '',
                    titleEditable: true,
                    subtitle: selectedRoute
                        ? selectedRoute.isIndex
                            ? 'Index route'
                            : selectedRoute.path
                        : '',
                    sections: toolSections,
                    mainButtons: toolMainButtons,
                    windowMinWidth: 360
                })
            ])
        ]);

        const routesList = this._renderRouteList(null, this.props.routes, List());

        const deleteRouteDialogButtons = [
            { text: 'Delete', onPress: this._handleDeleteRouteConfirm },
            { text: 'Cancel', onPress: this._handleDeleteRouteCancel }
        ];

        return (
            <Desktop toolGroups={toolGroups}>
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
                    visible={this.state.confirmDeleteDialogIsVisible}
                    onClose={this._handleDeleteRouteDialogClose}
                >
                    All child routes will be deleted too.
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
