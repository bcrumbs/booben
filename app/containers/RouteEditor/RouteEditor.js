/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
    BlockContentBox,
    BlockContentBoxItem,
    BlockContentBoxHeading
} from '../../components/BlockContent/BlockContent';

import {
    PropsList,
    PropsItem
} from '../../components/PropsList/PropsList';

import ProjectRouteRecord from '../../models/ProjectRoute';

import {
    updateRoutePath,
    updateRouteDescription,
    updateRouteIsIndex
} from '../../actions/project';

import {
    getRouteByIndexes,
    getRoutesByIndexes
} from '../../utils';

class RouteEditorComponent extends Component {
    constructor(props) {
        super(props);

        this._handleProps(props);

        this._handlePathChange = this._handlePathChange.bind(this);
        this._handleDescriptionChange = this._handleDescriptionChange.bind(this);
        this._handleIsIndexChange = this._handleIsIndexChange.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.haveSelectedRoute !== this.props.haveSelectedRoute ||
            nextProps.selectedRouteIndexes !== this.props.selectedRouteIndexes ||
            nextProps.routes !== this.props.routes;
    }

    componentWillReceiveProps(nextProps) {
        this._handleProps(nextProps);
    }

    _handleProps(props) {
        if (!props.haveSelectedRoute) return;

        this._where = props.selectedRouteIndexes.butLast();
        this._idx = props.selectedRouteIndexes.last();
        this._route = getRouteByIndexes(
            props.routes,
            this._where,
            this._idx
        );

        if (!this._route) return;

        if (this._route.children.size > 0) {
            this._isIndexDisabled = true;
        }
        else {
            const siblingRoutes = getRoutesByIndexes(props.routes, this._where)
                .delete(this._idx);

            this._isIndexDisabled = siblingRoutes.some(route => route.isIndex);
        }
    }

    _handlePathChange(newPath) {
        this.props.onPathChange(this._where, this._idx, newPath);
    }

    _handleDescriptionChange(newDescription) {
        this.props.onDescriptionChange(this._where, this._idx, newDescription);
    }

    _handleIsIndexChange(newIsIndex) {
        this.props.onIsIndexChange(this._where, this._idx, newIsIndex);
    }

    render() {
        if (!this.props.haveSelectedRoute || !this._route) return null;

        return (
            <BlockContentBox>
                <BlockContentBoxHeading>Route properties</BlockContentBoxHeading>
                <BlockContentBoxItem>
                    <PropsList>
                        <PropsItem
                            type="input"
                            label="Path"
                            value={this._route.path}
                            disabled={this._route.isIndex}
                            onChange={this._handlePathChange}
                        />

                        <PropsItem
                            type="toggle"
                            label="Is index route"
                            value={this._route.isIndex}
                            disabled={this._isIndexDisabled}
                            onChange={this._handleIsIndexChange}
                        />

                        <PropsItem
                            type="textarea"
                            label="Description"
                            value={this._route.description}
                            onChange={this._handleDescriptionChange}
                        />
                    </PropsList>
                </BlockContentBoxItem>
            </BlockContentBox>
        );
    }
}

RouteEditorComponent.propTypes = {
    routes: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(ProjectRouteRecord)
    ),

    haveSelectedRoute: PropTypes.bool,
    selectedRouteIndexes: ImmutablePropTypes.listOf(
        PropTypes.number
    ),

    onPathChange: PropTypes.func,
    onIsIndexChange: PropTypes.func,
    onDescriptionChange: PropTypes.func
};

RouteEditorComponent.displayName = 'RouteEditor';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    haveSelectedRoute: state.structure.selectedRouteId !== -1,
    selectedRouteIndexes: state.structure.selectedRouteIndexes
});

const mapDispatchToProps = dispatch => ({
    onPathChange: (where, idx, newPath) =>
        void dispatch(updateRoutePath(where, idx, newPath)),

    onDescriptionChange: (where, idx, newDescription) =>
        void dispatch(updateRouteDescription(where, idx, newDescription)),

    onIsIndexChange: (where, idx, newIsIndex) =>
        void dispatch(updateRouteIsIndex(where, idx, newIsIndex))
});

export const RouteEditor = connect(
    mapStateToProps,
    mapDispatchToProps
)(RouteEditorComponent);
