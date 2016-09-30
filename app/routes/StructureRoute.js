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
    Column
} from '@reactackle/reactackle';

import {
    RoutesList,
    RouteCard,
    RouteNewButton,
    RouteNewChildButton
} from '../components/RoutesList/RoutesList';

class StructureRoute extends Component {
    constructor(props) {
        super(props);

        this._renderRouteList = this._renderRouteList.bind(this);
        this._renderRouteCard = this._renderRouteCard.bind(this);
    }

    _renderRouteList(routes, isRoot) {
        const button = isRoot ? <RouteNewButton/> : <RouteNewChildButton/>;

        return (
            <RoutesList>
                {routes.map(this._renderRouteCard)}
                {button}
            </RoutesList>
        );
    }

    _renderRouteCard(route) {
        if (route.children.size === 0) {
            return (
                <RouteCard
                    key={route.id}
                    title={route.title || route.path}
                    subtitle={route.path}
                />
            );
        }
        else {
            return (
                <RouteCard
                    key={route.id}
                    title={route.title || route.path}
                    subtitle={route.path}
                >
                    {this._renderRouteList(route.children, false)}
                </RouteCard>
            );
        }
    }

    render() {
        return (
            <Desktop toolGroups={toolGroups}>
                <Panel headerFixed={true} maxHeight="initial">
                    <PanelContent>
                        <Container boxed>
                            <Row>
                                <Column>
                                    {this._renderRouteList(this.props.routes, true)}
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

    onCreateRoute: PropTypes.func,
    onDeleteRoute: PropTypes.func,
    onRenameRoute: PropTypes.func
};

StructureRoute.displayName = 'StructureRoute';

const mapStateToProps = state => ({
    routes: state.project.data.routes
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
