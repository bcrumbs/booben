/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
    BlockContentBox,
    BlockContentBoxItem,
    BlockContentBoxHeading,
    BlockContentPlaceholder
} from '../../components/BlockContent/BlockContent';

import {
    PropsList,
    PropsItem
} from '../../components/PropsList/PropsList';

import ProjectRouteRecord from '../../models/ProjectRoute';

import { updateRouteField } from '../../actions/project';

import { getLocalizedText } from '../../utils';

class RouteEditorComponent extends PureComponent {
    constructor(props) {
        super(props);

        this._handlePathChange = this._handlePathChange.bind(this);
        this._handleDescriptionChange = this._handleDescriptionChange.bind(this);
        this._handleHaveIndexChange = this._handleHaveIndexChange.bind(this);
        this._handleHaveRedirectChange = this._handleHaveRedirectChange.bind(this);
        this._handleRedirectToChange = this._handleRedirectToChange.bind(this);
        this._handleIndexRouteDescriptionChange = this._handleIndexRouteDescriptionChange.bind(this);
    }

    _handlePathChange(newPath) {
        this.props.onPathChange(this.props.selectedRouteId, newPath);
    }

    _handleDescriptionChange(newValue) {
        this.props.onDescriptionChange(this.props.selectedRouteId, newValue);
    }

    _handleHaveIndexChange(newValue) {
        this.props.onHaveIndexChange(this.props.selectedRouteId, newValue);
    }

    _handleHaveRedirectChange(newValue) {
        this.props.onHaveRedirectChange(this.props.selectedRouteId, newValue);
    }

    _handleRedirectToChange(newValue) {
        this.props.onRedirectToChange(this.props.selectedRouteId, newValue);
    }

    _handleIndexRouteDescriptionChange(newValue) {
        this.props.onIndexRouteDescriptionChange(this.props.selectedRouteId, newValue);
    }

    render() {
        const { getLocalizedText } = this.props;

        if (this.props.selectedRouteId === -1) return (
            <BlockContentPlaceholder text={getLocalizedText('noRouteSelected')} />
        );

        const route = this.props.routes.get(this.props.selectedRouteId);

        if (this.props.indexRouteSelected) {
            return (
                <BlockContentBox>
                    <BlockContentBoxHeading>
                      {getLocalizedText('indexRouteProperties')}
                    </BlockContentBoxHeading>

                    <BlockContentBoxItem>
                        <PropsList>
                            <PropsItem
                                type="textarea"
                                label={getLocalizedText('description')}
                                value={route.indexRouteDescription}
                                onChange={this._handleIndexRouteDescriptionChange}
                            />
                        </PropsList>
                    </BlockContentBoxItem>
                </BlockContentBox>
            );
        }

        let redirectUrlInput = null,
            haveIndexToggle = null;

        if (route.haveRedirect) {
            redirectUrlInput = (
                <PropsItem
                    type="input"
                    label={ getLocalizedText('redirectTo') }
                    value={route.redirectTo}
                    onChange={this._handleRedirectToChange}
                />
            );
        }
        else {
            haveIndexToggle = (
                <PropsItem
                    type="toggle"
                    label={ getLocalizedText('indexRoute') }
                    value={route.haveIndex}
                    onChange={this._handleHaveIndexChange}
                />
            );
        }

        return (
            <BlockContentBox>
                <BlockContentBoxHeading>
                    {getLocalizedText('routeProperties')}
                </BlockContentBoxHeading>

                <BlockContentBoxItem>
                    <PropsList>
                        <PropsItem
                            type="input"
                            label={getLocalizedText('path')}
                            value={route.path}
                            onChange={this._handlePathChange}
                        />

                        <PropsItem
                            type="textarea"
                            label={getLocalizedText('description')}
                            value={route.description}
                            onChange={this._handleDescriptionChange}
                        />

                        <PropsItem
                            type="toggle"
                            label={getLocalizedText('indexRedirect')}
                            value={route.haveRedirect}
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
    routes: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectRouteRecord),
        PropTypes.number
    ),

    selectedRouteId: PropTypes.number,
    indexRouteSelected: PropTypes.bool,

    getLocalizedText: PropTypes.func,
    onPathChange: PropTypes.func,
    onDescriptionChange: PropTypes.func,
    onHaveIndexChange: PropTypes.func,
    onHaveRedirectChange: PropTypes.func,
    onRedirectToChange: PropTypes.func,
    onIndexRouteDescriptionChange: PropTypes.func
};

RouteEditorComponent.displayName = 'RouteEditor';

const mapStateToProps = ({ project, app }) => ({
    routes: project.data.routes,
    selectedRouteId: project.selectedRouteId,
    indexRouteSelected: project.indexRouteSelected,
    language: app.language,
    getLocalizedText(...args) { return getLocalizedText(app.localization, app.language, ...args) }
});

const mapDispatchToProps = dispatch => ({
    onPathChange: (routeId, newValue) =>
        void dispatch(updateRouteField(routeId, 'path', newValue)),

    onDescriptionChange: (routeId, newValue) =>
        void dispatch(updateRouteField(routeId, 'description', newValue)),

    onHaveIndexChange: (routeId, newValue) =>
        void dispatch(updateRouteField(routeId, 'haveIndex', newValue)),

    onHaveRedirectChange: (routeId, newValue) =>
        void dispatch(updateRouteField(routeId, 'haveRedirect', newValue)),

    onRedirectToChange: (routeId, newValue) =>
        void dispatch(updateRouteField(routeId, 'redirectTo', newValue)),

    onIndexRouteDescriptionChange: (routeId, newValue) =>
        void dispatch(updateRouteField(routeId, 'indexRouteDescription', newValue))
});

export const RouteEditor = connect(
    mapStateToProps,
    mapDispatchToProps
)(RouteEditorComponent);
