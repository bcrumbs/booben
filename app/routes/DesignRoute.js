/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { Desktop } from '../containers/Desktop/Desktop';
import { ComponentsLibrary } from '../containers/ComponentsLibrary/ComponentsLibrary';
import { ComponentsTreeView } from '../containers/ComponentsTreeView/ComponentsTreeView';
import { ComponentPropsEditor } from '../containers/ComponentPropsEditor/ComponentPropsEditor';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';

import store from '../store';
import { findRouteById } from '../utils';

import ProjectRecord from '../models/Project';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';

import {
    renameComponent,
    deleteComponent
} from '../actions/project';

import { List } from 'immutable';


const TOOL_ID_LIBRARY = 'componentsLibrary';
const TOOL_ID_COMPONENTS_TREE = 'componentsTree';
const TOOL_ID_PROPS_EDITOR = 'componentPropsEditor';

const LIBRARY_ICON = 'cubes';
const COMPONENTS_TREE_ICON = 'sitemap';
const PROPS_EDITOR_ICON = 'sliders';

export const DESIGN_TOOL_IDS = List([
    TOOL_ID_LIBRARY,
    TOOL_ID_COMPONENTS_TREE,
    TOOL_ID_PROPS_EDITOR
]);

const libraryTool = new ToolRecord({
    id: TOOL_ID_LIBRARY,
    icon: LIBRARY_ICON,
    name: 'Components Library',
    title: 'Components Library',
    sections: List([
        new ToolSectionRecord({
            name: '',
            component: ComponentsLibrary
        })
    ]),
    windowMinWidth: 360
});

class DesignRoute extends Component {
    constructor(props) {
        super(props);

        this._handleToolTitleChange = this._handleToolTitleChange.bind(this);
        this._handleDeleteComponentButtonPress = this._handleDeleteComponentButtonPress.bind(this);
    }

    /**
     *
     * @param {ToolRecord} tool
     * @param {string} newTitle
     * @private
     */
    _handleToolTitleChange(tool, newTitle) {
        if (tool.id === TOOL_ID_PROPS_EDITOR) {
            const componentId = this.props.selectedComponentIds.first();
            this.props.onRenameComponent(componentId, newTitle);
        }
    }

    /**
     *
     * @private
     */
    _handleDeleteComponentButtonPress() {
        this.props.onDeleteComponent(this.props.selectedComponentIds.first());
    }

    render() {
        const src = `/preview/${this.props.params.projectName}/index.html`,
            routeId = parseInt(this.props.params.routeId),
            isIndexRoute = this.props.location.pathname.endsWith('/index'),
            route = findRouteById(this.props.project.routes, routeId);

        // TODO: Show error screen
        if (!route) return null;

        const rootComponent = isIndexRoute ? route.indexComponent : route.component;

        const treeTool = new ToolRecord({
            id: TOOL_ID_COMPONENTS_TREE,
            icon: COMPONENTS_TREE_ICON,
            name: 'Elements tree',
            title: 'Elements tree',
            sections: List([
                new ToolSectionRecord({
                    name: '',
                    component: () => (
                        <ComponentsTreeView route={route} isIndexRoute={isIndexRoute} />
                    )
                })
            ])
        });

        const singleComponentSelected = this.props.selectedComponentIds.size === 1;
        let title, subtitle, mainButtons;

        if (singleComponentSelected) {
            const componentId = this.props.selectedComponentIds.first(),
                componentIndexData = this.props.componentsIndex.get(componentId),
                component = this.props.project.getIn(componentIndexData.path);

            title = component.title;
            subtitle = component.name;
            mainButtons = List([
                new ButtonRecord({
                    text: 'Delete',
                    disabled: !singleComponentSelected,
                    onPress: this._handleDeleteComponentButtonPress
                })
            ]);
        }
        else {
            title = 'Component configuration';
            subtitle = '';
            mainButtons = List();
        }

        const propsEditorTool = new ToolRecord({
            id: TOOL_ID_PROPS_EDITOR,
            icon: PROPS_EDITOR_ICON,
            name: 'Component configuration',
            title: title,
            titleEditable: singleComponentSelected,
            titlePlaceholder: 'Enter title',
            subtitle: subtitle,
            mainButtons: mainButtons,
            sections: List([
                new ToolSectionRecord({
                    name: '',
                    component: ComponentPropsEditor
                })
            ])
        });

        const toolGroups = List([List([libraryTool, treeTool, propsEditorTool])]);

        return (
            <Desktop
                toolGroups={toolGroups}
                onToolTitleChange={this._handleToolTitleChange}
            >
                <PreviewIFrame
                    interactive
                    store={store}
                    url={src}
                    path={route.fullPath}
                    isIndexRoute={isIndexRoute}
                />
            </Desktop>
        );
    }
}

DesignRoute.propTypes = {
    project: PropTypes.instanceOf(ProjectRecord),
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    componentsIndex: ImmutablePropTypes.map,

    onRenameComponent: PropTypes.func,
    onDeleteComponent: PropTypes.func
};

const mapStateToProps = state => ({
    project: state.project.data,
    selectedComponentIds: state.preview.selectedItems,
    componentsIndex: state.project.componentsIndex
});

const mapDispatchToProps = dispatch => ({
    onRenameComponent: (componentId, newTitle) =>
        void dispatch(renameComponent(componentId, newTitle)),

    onDeleteComponent: componentId => dispatch(deleteComponent(componentId))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DesignRoute);
