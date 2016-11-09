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
import { ComponentRegionsEditor } from '../containers/ComponentRegionsEditor/ComponentRegionsEditor';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';

import {
    ComponentLayoutSelection,
    ComponentLayoutSelectionItem
} from '../components/ComponentLayoutSelection/ComponentLayoutSelection';

import { Dialog } from '@reactackle/reactackle';

import store from '../store';

import ProjectRecord, { getComponentById } from '../models/Project';
import ProjectComponentRecord from '../models/ProjectComponent';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';

import {
    renameComponent,
    deleteComponent,
    selectLayoutForNewComponent
} from '../actions/project';

import {
    getComponentMeta,
    isCompositeComponent,
    getString
} from '../utils/meta';

import { getLocalizedText } from '../utils';

//noinspection JSUnresolvedVariable
import defaultComponentLayoutIcon from '../img/layout_default.svg';

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

        this.state = {
            confirmDeleteComponentDialogIsVisible: false
        };

        this._handleToolTitleChange = this._handleToolTitleChange.bind(this);
        this._handleDeleteComponentButtonPress = this._handleDeleteComponentButtonPress.bind(this);
        this._handleDeleteComponentConfirm = this._handleDeleteComponentConfirm.bind(this);
        this._handleDeleteComponentCancel = this._handleDeleteComponentCancel.bind(this);
        this._handleConfirmDeleteComponentDialogClose = this._handleConfirmDeleteComponentDialogClose.bind(this);
    }

    /**
     *
     * @param {Object} tool
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
        this.setState({
            confirmDeleteComponentDialogIsVisible: true
        });
    }

    /**
     *
     * @param {Function} closeDialog
     * @private
     */
    _handleDeleteComponentConfirm(closeDialog) {
        this.props.onDeleteComponent(this.props.selectedComponentIds.first());
        closeDialog();
    }

    /**
     *
     * @param {Function} closeDialog
     * @private
     */
    _handleDeleteComponentCancel(closeDialog) {
        closeDialog();
    }

    /**
     *
     * @private
     */
    _handleConfirmDeleteComponentDialogClose() {
        this.setState({
            confirmDeleteComponentDialogIsVisible: false
        });
    }

    render() {
        const { getLocalizedText } = this.props,
            src = `/preview/${this.props.params.projectName}/index.html`,
            routeId = parseInt(this.props.params.routeId),
            isIndexRoute = this.props.location.pathname.endsWith('/index'),
            route = this.props.project.routes.get(routeId);

        const libraryTool = new ToolRecord({
            id: TOOL_ID_LIBRARY,
            icon: LIBRARY_ICON,
            name: getLocalizedText('componentsLibrary'),
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
            name: getLocalizedText('elementsTree'),
            title: getLocalizedText('elementsTree'),
            sections: List([
                new ToolSectionRecord({
                    name: '',
                    component: props => <ComponentsTreeView route={route} isIndexRoute={isIndexRoute} {...props}/>
                })
            ])
        });

        const singleComponentSelected = this.props.selectedComponentIds.size === 1;
        let title, subtitle, mainButtons, sections;

        const propsEditorSection = new ToolSectionRecord({
            name: 'General',
            component: ComponentPropsEditor
        });

        if (singleComponentSelected) {
            const componentId = this.props.selectedComponentIds.first(),
                component = getComponentById(this.props.project, componentId);

            const parentComponent = component.parentId > -1
                ? getComponentById(this.props.project, component.parentId)
                : null;

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

                if (isCompositeComponent(component.name, this.props.meta)) {
                    const regionsEditorSection = new ToolSectionRecord({
                        name: 'Regions',
                        component: ComponentRegionsEditor
                    });

                    sections = List([propsEditorSection, regionsEditorSection]);
                }
                else {
                    sections = List([propsEditorSection]);
                }
            }
            else {
                mainButtons = List();
                sections = List([propsEditorSection]);
            }
        }
        else {
            title =  getLocalizedText('componentConfiguration');
            subtitle = '';
            mainButtons = List();
            sections = List([propsEditorSection])
        }

        const propsEditorTool = new ToolRecord({
            id: TOOL_ID_PROPS_EDITOR,
            icon: PROPS_EDITOR_ICON,
            name: getLocalizedText('componentConfiguration'),
            title: title,
            titleEditable: singleComponentSelected,
            titlePlaceholder: getLocalizedText('enterTitle'),
            subtitle: subtitle,
            mainButtons: mainButtons,
            sections: sections
        });

        const toolGroups = List([List([libraryTool, treeTool, propsEditorTool])]);

        let layoutSelectionDialogContent = null;
        if (this.props.selectingComponentLayout) {
            const draggedComponent = this.props.draggedComponents.get(0);

            const draggedComponentMeta =
                getComponentMeta(draggedComponent.name, this.props.meta);

            const items = draggedComponentMeta.layouts.map((layout, idx) => {
                const icon = layout.icon || defaultComponentLayoutIcon;

                const title = getString(
                    draggedComponentMeta,
                    layout.textKey,
                    this.props.language
                );

                const subtitle = getString(
                    draggedComponentMeta,
                    layout.descriptionTextKey,
                    this.props.language
                );

                return (
                    <ComponentLayoutSelectionItem
                        image={icon}
                        title={title}
                        subtitle={subtitle}
                        onClick={this.props.onSelectLayout.bind(null, idx)}
                    />
                );
            });

            layoutSelectionDialogContent = (
                <ComponentLayoutSelection>
                    {items}
                </ComponentLayoutSelection>
            );
        }

        const confirmDeleteDialogButtons = [
            { text: getLocalizedText('delete'), onPress: this._handleDeleteComponentConfirm },
            { text: getLocalizedText('cancel'), onPress: this._handleDeleteComponentCancel }
        ];

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
                />

                <Dialog
                    title={getLocalizedText('selectLayout')}
                    backdrop
                    minWidth={400}
                    visible={this.props.selectingComponentLayout}
                >
                    {layoutSelectionDialogContent}
                </Dialog>

                <Dialog
                    title={getLocalizedText('deleteComponent')}
                    backdrop
                    minWidth={400}
                    buttons={confirmDeleteDialogButtons}
                    visible={this.state.confirmDeleteComponentDialogIsVisible}
                    closeOnEscape
                    closeOnBackdropClick
                    onClose={this._handleConfirmDeleteComponentDialogClose}
                    onEnterKeyPress={this._handleDeleteComponentConfirm}
                >
                    {getLocalizedText('deleteThisComponentQuestion')}
                </Dialog>
            </Desktop>
        );
    }
}

DesignRoute.propTypes = {
    project: PropTypes.instanceOf(ProjectRecord),
    meta: PropTypes.object,
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    selectingComponentLayout: PropTypes.bool,
    draggedComponents: ImmutablePropTypes.mapOf(PropTypes.instanceOf(ProjectComponentRecord)),
    language: PropTypes.string,
    getLocalizedText: PropTypes.func,

    onRenameComponent: PropTypes.func,
    onDeleteComponent: PropTypes.func,
    onSelectLayout: PropTypes.func
};

const mapStateToProps = ({ project, app }) => ({
    project: project.data,
    meta: project.meta,
    selectedComponentIds: project.selectedItems,
    selectingComponentLayout: project.selectingComponentLayout,
    draggedComponents: project.draggedComponents,
    language: app.language,
    getLocalizedText(...args) { return getLocalizedText(app.localization, app.language, ...args) }
});

const mapDispatchToProps = dispatch => ({
    onRenameComponent: (componentId, newTitle) =>
        void dispatch(renameComponent(componentId, newTitle)),

    onDeleteComponent: componentId =>
        void dispatch(deleteComponent(componentId)),

    onSelectLayout: layoutIdx =>
        void dispatch(selectLayoutForNewComponent(layoutIdx))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DesignRoute);
