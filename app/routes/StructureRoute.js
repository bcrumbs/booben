/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';

import toolGroups from '../tools/structure';

import ProjectRouteRecord from '../models/ProjectRoute';

import {
    createRoute,
    deleteRoute,
    renameRoute
} from '../actions/project';

import {
    Panel,
    PanelContent,
    Container,
    Row,
    Column,
    Dialog
} from '@reactackle/reactackle';

import {
    RoutesList,
    RouteCard,
    RouteNewButton
} from '../components/RoutesList/RoutesList';

import { List } from 'immutable';

import history from '../history';

class StructureRoute extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedRouteId: props.routes.size > 0 ? props.routes.get(0).id : null
        };

        this._renderRouteList = this._renderRouteList.bind(this);
        this._renderRouteCard = this._renderRouteCard.bind(this);
    }

    _handleRouteSelect(route) {
        this.setState({
            selectedRouteId: route.id
        });
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

        const needButton = parentRoute === null || (
            !parentRoute.isIndex &&
            parentRoute.id === this.state.selectedRouteId
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
        const isSelected = this.state.selectedRouteId === route.id;

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
                onFocus={this._handleRouteSelect.bind(this, route)}
                onGo={this._handleRouteGo.bind(this, route)}
            >
                {children}
            </RouteCard>
        );
    }

    render() {
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

    onCreateRoute: PropTypes.func,
    onDeleteRoute: PropTypes.func,
    onRenameRoute: PropTypes.func
};

StructureRoute.displayName = 'StructureRoute';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    projectName: state.project.projectName
});

const mapDispatchToProps = dispatch => ({
    onCreateRoute: (where, path, title) => void dispatch(createRoute(where, path, title)),
    onDeleteRoute: (where, idx) => void dispatch(deleteRoute(where, idx)),
    onRenameRoute: (where, idx, newTitle) => void dispatch(renameRoute(where, idx, newTitle))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StructureRoute);
