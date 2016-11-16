/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Desktop } from '../containers/Desktop/Desktop';
import { ComponentsLibrary } from '../containers/ComponentsLibrary/ComponentsLibrary';
import { ComponentsTreeView } from '../containers/ComponentsTreeView/ComponentsTreeView';
import { ComponentPropsEditor } from '../containers/ComponentPropsEditor/ComponentPropsEditor';
import { ComponentRegionsEditor } from '../containers/ComponentRegionsEditor/ComponentRegionsEditor';
import { LinkPropMenu } from '../containers/LinkPropMenu/LinkPropMenu';
import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';

import {
    ComponentLayoutSelection,
    ComponentLayoutSelectionItem
} from '../components/ComponentLayoutSelection/ComponentLayoutSelection';

import {
    IsolationView
} from '../components/IsolationView/IsolationView';

import {
    Dialog,
    Header,
    HeaderRegion,
    HeaderTitle,
    Panel,
    PanelContent,
    Button,
    Breadcrumbs
} from '@reactackle/reactackle';

import store from '../store';

import ProjectRecord from '../models/Project';
import ProjectComponentRecord from '../models/ProjectComponent';
import ToolRecord from '../models/Tool';
import ToolSectionRecord from '../models/ToolSection';
import ButtonRecord from '../models/Button';

import {
    renameComponent,
    deleteComponent,
    selectLayoutForNewComponent,
    saveComponentForProp,
    cancelConstructComponentForProp,
    linkPropCancel
} from '../actions/project';

import {
    haveNestedConstructorsSelector,
    singleComponentSelectedSelector,
    firstSelectedComponentIdSelector,
    currentComponentsSelector
} from '../selectors';

import {
    getComponentMeta,
    isCompositeComponent,
    getString,
    getComponentPropName
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

const containerStyleSelector = createSelector(
    state => state.project.meta,

    meta => {
        const combinedStyle = Object.keys(meta).reduce(
            (acc, cur) => Object.assign(acc, meta[cur].containerStyle || {}),
            {}
        );

        return Object.keys(combinedStyle)
            .map(prop => `${prop}:${combinedStyle[prop]}`)
            .join(';');
    }
);

const nestedConstructorBreadcrumbsSelector = createSelector(
    state => state.project.data,
    state => state.project.currentRouteId,
    state => state.project.nestedConstructors,
    state => state.project.meta,
    state => state.project.languageForComponentProps,

    (project, currentRouteId, nestedConstructors, meta, language) => {
        const returnEmpty =
            !project ||
            currentRouteId === -1 ||
            nestedConstructors.isEmpty();

        if (returnEmpty) return List();

        return nestedConstructors.reduceRight((acc, cur) => {
            const component = acc.components.get(cur.componentId),
                title = component.title || component.name,
                componentMeta = getComponentMeta(component.name, meta),
                propName = getComponentPropName(componentMeta, cur.prop, language);

            return {
                ret: acc.ret.push(title, propName),
                components: cur.components
            };
        }, {
            ret: List(),
            components: project.routes.get(currentRouteId).components
        }).ret;
    }
);

const NestedConstructorsBreadcrumbsItem = props => (
    <span className={props.className}>
        {props.children}
    </span>
);

class DesignRoute extends PureComponent {
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
        this._handleLinkPropDialogCancel = this._handleLinkPropDialogCancel.bind(this);
    }

    /**
     *
     * @param {Object} tool
     * @param {string} newTitle
     * @private
     */
    _handleToolTitleChange(tool, newTitle) {
        if (tool.id === TOOL_ID_PROPS_EDITOR) {
            this.props.onRenameComponent(this.props.firstSelectedComponentId, newTitle);
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
        this.props.onDeleteComponent(this.props.firstSelectedComponentId);
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

    /**
     *
     * @private
     */
    _handleLinkPropDialogCancel() {
        this.props.onLinkPropCancel();
    }

    render() {
        // TODO: Handle index routes
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
                    component: ComponentsTreeView
                })
            ])
        });

        const propsEditorSection = new ToolSectionRecord({
            name: 'General',
            component: ComponentPropsEditor
        });

        let title = '',
            subtitle = '',
            mainButtons = List(),
            sections = List([propsEditorSection]);

        if (this.props.singleComponentSelected) {
            const selectedComponent = this.props.components.get(
                this.props.firstSelectedComponentId
            );

            const parentComponent = selectedComponent.parentId > -1
                ? this.props.components.get(selectedComponent.parentId)
                : null;

            const isRegion = parentComponent
                ? isCompositeComponent(parentComponent.name, this.props.meta)
                : false;

            title = selectedComponent.title;
            subtitle = selectedComponent.name;

            if (!isRegion) {
                if (!selectedComponent.isWrapper) {
                    mainButtons = mainButtons.push(
                        new ButtonRecord({
                            text: getLocalizedText('delete'),
                            onPress: this._handleDeleteComponentButtonPress
                        })
                    )
                }

                if (isCompositeComponent(selectedComponent.name, this.props.meta)) {
                    sections = sections.push(
                        new ToolSectionRecord({
                            name: 'Regions',
                            component: ComponentRegionsEditor
                        })
                    );
                }
            }
        }
        else {
            title = getLocalizedText('componentConfiguration');
        }

        const propsEditorTool = new ToolRecord({
            id: TOOL_ID_PROPS_EDITOR,
            icon: PROPS_EDITOR_ICON,
            name: getLocalizedText('componentConfiguration'),
            title: title,
            titleEditable: this.props.singleComponentSelected,
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

        const previewIFrame = (
            <PreviewIFrame
                interactive
                store={store}
                url={src}
                path={route.fullPath}
                containerStyle={this.props.previewContainerStyle}
            />
        );

        // TODO: Prevent re-creation of PreviewIFrame on haveNestedConstructor change
        let content;
        if (this.props.haveNestedConstructor) {
            // Render additional UI for nested constructor
            const breadcrumbsItems = this.props.nestedConstructorBreadcrumbs
                .toArray()
                .map(item => ({ title: item }));

            content = (
                <Panel headerFixed maxHeight="initial">
                    <Header>
                        <HeaderRegion spread alignY="center">
                            <HeaderTitle>
                                <Breadcrumbs
                                    items={breadcrumbsItems}
                                    linkComponent={NestedConstructorsBreadcrumbsItem}
                                />
                            </HeaderTitle>
                        </HeaderRegion>
                        <HeaderRegion>
                            <Button
                                text={getLocalizedText('cancel')}
                                light
                                onPress={this.props.onCancelConstructComponentForProp}
                            />

                            <Button
                                text={getLocalizedText('ok')}
                                light
                                onPress={this.props.onSaveComponentForProp}
                            />
                        </HeaderRegion>
                    </Header>

                    <PanelContent>
                        <IsolationView>
                            {previewIFrame}
                        </IsolationView>
                    </PanelContent>
                </Panel>
            );
        }
        else {
            // Render main constructor only
            content = previewIFrame;
        }

        const linkPropDialogButtons = [{
            text: getLocalizedText('cancel'),
            onPress: this._handleLinkPropDialogCancel
        }];

        return (
            <Desktop
                toolGroups={toolGroups}
                onToolTitleChange={this._handleToolTitleChange}
            >
                {content}

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

                <Dialog
                    title="Select prop"
                    minWidth={400}
                    buttons={linkPropDialogButtons}
                    visible={this.props.linkingProp}
                    closeOnEscape
                    onClose={this._handleLinkPropDialogCancel}
                >
                    <LinkPropMenu/>
                </Dialog>
            </Desktop>
        );
    }
}

DesignRoute.propTypes = {
    project: PropTypes.instanceOf(ProjectRecord),
    components: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number
    ),
    meta: PropTypes.object,
    previewContainerStyle: PropTypes.string,
    singleComponentSelected: PropTypes.bool,
    firstSelectedComponentId: PropTypes.number,
    selectingComponentLayout: PropTypes.bool,
    draggedComponents: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number
    ),
    language: PropTypes.string,
    haveNestedConstructor: PropTypes.bool,
    nestedConstructorBreadcrumbs: ImmutablePropTypes.listOf(PropTypes.string),
    linkingProp: PropTypes.bool,
    getLocalizedText: PropTypes.func,

    onRenameComponent: PropTypes.func,
    onDeleteComponent: PropTypes.func,
    onSelectLayout: PropTypes.func,
    onSaveComponentForProp: PropTypes.func,
    onCancelConstructComponentForProp: PropTypes.func,
    onLinkPropCancel: PropTypes.func
};

const mapStateToProps = state => ({
    project: state.project.data,
    components: currentComponentsSelector(state),
    meta: state.project.meta,
    previewContainerStyle: containerStyleSelector(state),
    singleComponentSelected: singleComponentSelectedSelector(state),
    firstSelectedComponentId: firstSelectedComponentIdSelector(state),
    selectingComponentLayout: state.project.selectingComponentLayout,
    draggedComponents: state.project.draggedComponents,
    language: state.project.languageForComponentProps,
    haveNestedConstructor: haveNestedConstructorsSelector(state),
    nestedConstructorBreadcrumbs: nestedConstructorBreadcrumbsSelector(state),
    linkingProp: state.project.linkingProp,
    getLocalizedText: (...args) => getLocalizedText(
        state.app.localization,
        state.app.language,
        ...args
    )
});

const mapDispatchToProps = dispatch => ({
    onRenameComponent: (componentId, newTitle) =>
        void dispatch(renameComponent(componentId, newTitle)),

    onDeleteComponent: componentId =>
        void dispatch(deleteComponent(componentId)),

    onSelectLayout: layoutIdx =>
        void dispatch(selectLayoutForNewComponent(layoutIdx)),

    onSaveComponentForProp: () =>
        void dispatch(saveComponentForProp()),

    onCancelConstructComponentForProp: () =>
        void dispatch(cancelConstructComponentForProp()),

    onLinkPropCancel: () =>
        void dispatch(linkPropCancel())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DesignRoute);
