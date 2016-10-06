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

import { updateRouteField } from '../../actions/project';

import { getRouteByIndexes } from '../../utils';

class RouteEditorComponent extends Component {
    constructor(props) {
        super(props);

        this._handleProps(props);

        this._handlePathChange = this._handlePathChange.bind(this);
        this._handleDescriptionChange = this._handleDescriptionChange.bind(this);
        this._handleHaveIndexChange = this._handleHaveIndexChange.bind(this);
        this._handleHaveRedirectChange = this._handleHaveRedirectChange.bind(this);
        this._handleRedirectToChange = this._handleRedirectToChange.bind(this);
        this._handleIndexRouteDescriptionChange = this._handleIndexRouteDescriptionChange.bind(this);
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
    }

    _handlePathChange(newPath) {
        this.props.onPathChange(this._where, this._idx, newPath);
    }

    _handleDescriptionChange(newValue) {
        this.props.onDescriptionChange(this._where, this._idx, newValue);
    }

    _handleHaveIndexChange(newValue) {
        this.props.onHaveIndexChange(this._where, this._idx, newValue);
    }

    _handleHaveRedirectChange(newValue) {
        this.props.onHaveRedirectChange(this._where, this._idx, newValue);
    }

    _handleRedirectToChange(newValue) {
        this.props.onRedirectToChange(this._where, this._idx, newValue);
    }

    _handleIndexRouteDescriptionChange(newValue) {
        this.props.onIndexRouteDescriptionChange(this._where, this._idx, newValue);
    }

    render() {
        if (!this.props.haveSelectedRoute || !this._route) return null;

        if (this.props.indexRouteSelected) {
            return (
                <BlockContentBox>
                    <BlockContentBoxHeading>
                        Index route properties
                    </BlockContentBoxHeading>

                    <BlockContentBoxItem>
                        <PropsList>
                            <PropsItem
                                type="textarea"
                                label="Description"
                                value={this._route.indexRouteDescription}
                                onChange={this._handleIndexRouteDescriptionChange}
                            />
                        </PropsList>
                    </BlockContentBoxItem>
                </BlockContentBox>
            );
        }

        let redirectUrlInput = null,
            haveIndexToggle = null;

        if (this._route.haveRedirect) {
            redirectUrlInput = (
                <PropsItem
                    type="input"
                    label="Redirect to"
                    value={this._route.redirectTo}
                    onChange={this._handleRedirectToChange}
                />
            );
        }
        else {
            haveIndexToggle = (
                <PropsItem
                    type="toggle"
                    label="Index route"
                    value={this._route.haveIndex}
                    onChange={this._handleHaveIndexChange}
                />
            );
        }

        return (
            <BlockContentBox>
                <BlockContentBoxHeading>Route properties</BlockContentBoxHeading>
                <BlockContentBoxItem>
                    <PropsList>
                        <PropsItem
                            type="input"
                            label="Path"
                            value={this._route.path}
                            onChange={this._handlePathChange}
                        />

                        <PropsItem
                            type="textarea"
                            label="Description"
                            value={this._route.description}
                            onChange={this._handleDescriptionChange}
                        />

                        <PropsItem
                            type="toggle"
                            label="Index redirect"
                            value={this._route.haveRedirect}
                            onChange={this._handleHaveRedirectChange}
                        />

                        {haveIndexToggle}

                        {redirectUrlInput}
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

    indexRouteSelected: PropTypes.bool,

    onPathChange: PropTypes.func,
    onDescriptionChange: PropTypes.func,
    onHaveIndexChange: PropTypes.func,
    onHaveRedirectChange: PropTypes.func,
    onRedirectToChange: PropTypes.func,
    onIndexRouteDescriptionChange: PropTypes.func
};

RouteEditorComponent.displayName = 'RouteEditor';

const mapStateToProps = state => ({
    routes: state.project.data.routes,
    haveSelectedRoute: state.structure.selectedRouteId !== -1,
    selectedRouteIndexes: state.structure.selectedRouteIndexes,
    indexRouteSelected: state.structure.indexRouteSelected
});

const mapDispatchToProps = dispatch => ({
    onPathChange: (where, idx, newValue) =>
        void dispatch(updateRouteField(where, idx, 'path', newValue)),

    onDescriptionChange: (where, idx, newValue) =>
        void dispatch(updateRouteField(where, idx, 'description', newValue)),

    onHaveIndexChange: (where, idx, newValue) =>
        void dispatch(updateRouteField(where, idx, 'haveIndex', newValue)),

    onHaveRedirectChange: (where, idx, newValue) =>
        void dispatch(updateRouteField(where, idx, 'haveRedirect', newValue)),

    onRedirectToChange: (where, idx, newValue) =>
        void dispatch(updateRouteField(where, idx, 'redirectTo', newValue)),

    onIndexRouteDescriptionChange: (where, idx, newValue) =>
        void dispatch(updateRouteField(where, idx, 'indexRouteDescription', newValue))
});

export const RouteEditor = connect(
    mapStateToProps,
    mapDispatchToProps
)(RouteEditorComponent);
