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

import ProjectRecord from '../models/Project';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';

import {
    renameComponent,
    deleteComponent
} from '../actions/project';

import { isCompositeComponent } from '../utils/meta';

import { getLocalizedText } from '../utils';

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

    _getParentComponent(component) {
        const indexEntry = this.props.componentsIndex.get(component.id);
        if (indexEntry.path.get(indexEntry.path.size - 2) !== 'children') return null;
        return this.props.project.getIn(indexEntry.path.slice(0, -2));
    }

    render() {
        const { getLocalizedText } = this.props;
        const src = `/preview/${this.props.params.projectName}/index.html`,
            routeId = parseInt(this.props.params.routeId),
            isIndexRoute = this.props.location.pathname.endsWith('/index'),
            routeIndexEntry = this.props.routesIndex.get(routeId);

        // TODO: Show error screen
        if (!routeIndexEntry) return null;

        const route = this.props.project.getIn(routeIndexEntry.path);


        const libraryTool = new ToolRecord({
            id: TOOL_ID_LIBRARY,
            icon: LIBRARY_ICON,
            name: 'Components Library',
            title: getLocalizedText('componentsLibrary'),
            sections: List([
                new ToolSectionRecord({
                    name: '',
                    component: ComponentsLibrary
                })
            ]),
            windowMinWidth: 360
        });


        const treeTool = new ToolRecord({
            id: TOOL_ID_COMPONENTS_TREE,
            icon: COMPONENTS_TREE_ICON,
            name: 'Elements Tree',
            title: getLocalizedText('elementsTree'),
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
                component = this.props.project.getIn(componentIndexData.path),
                parentComponent = this._getParentComponent(component);

            const isRegion = parentComponent
                ? isCompositeComponent(parentComponent.name, this.props.meta)
                : false;

            title = component.title;
            subtitle = component.name;

            if (!isRegion) {
                mainButtons = List([
                    new ButtonRecord({
                        text: getLocalizedText('delete'),
                        disabled: !singleComponentSelected,
                        onPress: this._handleDeleteComponentButtonPress
                    })
                ]);
            }
            else {
                mainButtons = List();
            }
        }
        else {
            title =  getLocalizedText('componentConfiguration');
            subtitle = '';
            mainButtons = List();
        }

        const propsEditorTool = new ToolRecord({
            id: TOOL_ID_PROPS_EDITOR,
            icon: PROPS_EDITOR_ICON,
            name: 'Component configuration',
            title: title,
            titleEditable: singleComponentSelected,
            titlePlaceholder: getLocalizedText('enterTitle'),
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
    meta: PropTypes.object,
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    componentsIndex: ImmutablePropTypes.map,
    routesIndex: ImmutablePropTypes.map,

    onRenameComponent: PropTypes.func,
    onDeleteComponent: PropTypes.func
};

const mapStateToProps = state => ({
    project: state.project.data,
    meta: state.project.meta,
    selectedComponentIds: state.preview.selectedItems,
    componentsIndex: state.project.componentsIndex,
    routesIndex: state.project.routesIndex,
    getLocalizedText(...args) { return getLocalizedText(state.app.localization, state.app.language, ...args) }
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
