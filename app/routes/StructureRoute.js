/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
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

        this._renderRouteList = this._renderRouteList.bind(this);
        this._renderRouteCard = this._renderRouteCard.bind(this);
    }

    componentDidMount() {
        if (this.props.selectedRouteId === -1 && this.props.routes.size > 0)
            this._handleRouteSelect(this.props.routes.get(0), List([0]));
    }

    _handleRouteSelect(route, indexes) {
        this.props.onSelectRoute(route, indexes);
    }

    _handleRouteGo(route) {
        history.push(`/${this.props.projectName}/design/${route.id}`);
    }

    _handleNewRoutePress(indexes) {

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
            // TODO: Get text from i18n
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

        const toolGroups = List([
            List([
                new ToolRecord({
                    id: 'routeEditor',
                    icon: 'random',
                    name: 'Route editor',
                    title: selectedRoute ? selectedRoute.title : '',
                    titleEditable: true,
                    subtitle: selectedRoute ? selectedRoute.path : '',
                    undockable: true,
                    closable: true,
                    sections: List([
                        new ToolSectionRecord({
                            component: RouteEditor
                        })
                    ]),
                    mainButtons: List(),
                    secondaryButtons: List([
                        new ButtonRecord({
                            icon: 'trash'
                        })
                    ]),
                    windowMaxHeight: 0,
                    windowMinWidth: 360
                })
            ])
        ]);

        const routesList = this._renderRouteList(null, this.props.routes, List());

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
            </Desktop>
        )
    }
}

StructureRoute.propTypes = {
    routes: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(ProjectRouteRecord)
    ),

    projectName: PropTypes.string,
    selectedRouteId: PropTypes.number,

    onSelectRoute: PropTypes.func,
    onCreateRoute: PropTypes.func,
    onDeleteRoute: PropTypes.func,
    onRenameRoute: PropTypes.func
};

StructureRoute.displayName = 'StructureRoute';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    projectName: state.project.projectName,
    selectedRouteId: state.structure.selectedRouteId
});

const mapDispatchToProps = dispatch => ({
    onSelectRoute: (route, indexes) => void dispatch(selectRoute(route.id, indexes)),
    onCreateRoute: (where, path, title) => void dispatch(createRoute(where, path, title)),
    onDeleteRoute: (where, idx) => void dispatch(deleteRoute(where, idx)),
    onRenameRoute: (where, idx, newTitle) => void dispatch(renameRoute(where, idx, newTitle))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StructureRoute);
