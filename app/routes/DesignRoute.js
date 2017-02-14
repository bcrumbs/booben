/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { List } from 'immutable';

import {
  Dialog,
  Header,
  HeaderRegion,
  HeaderTitle,
  Panel,
  PanelContent,
  Button,
  Breadcrumbs,
} from '@reactackle/reactackle';

import { Desktop } from '../containers/Desktop/Desktop';

import {
  ComponentsLibrary,
} from '../containers/ComponentsLibrary/ComponentsLibrary';

import {
  ComponentsTreeView,
} from '../containers/ComponentsTreeView/ComponentsTreeView';

import {
  ComponentPropsEditor,
} from '../containers/ComponentPropsEditor/ComponentPropsEditor';

import {
  ComponentRegionsEditor,
} from '../containers/ComponentRegionsEditor/ComponentRegionsEditor';

import { PreviewIFrame } from '../components/PreviewIFrame/PreviewIFrame';
import { LinkPropWindow } from '../containers/LinkPropWindow/LinkPropWindow';

import {
  ComponentLayoutSelection,
  ComponentLayoutSelectionItem,
} from '../components/ComponentLayoutSelection/ComponentLayoutSelection';

import store from '../store';

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
  linkPropCancel,
} from '../actions/project';

import {
  haveNestedConstructorsSelector,
  singleComponentSelectedSelector,
  firstSelectedComponentIdSelector,
  currentComponentsSelector,
} from '../selectors';

import {
  getComponentMeta,
  isCompositeComponent,
  getString,
  getComponentPropName,
} from '../utils/meta';

import { URL_PREVIEW_PREFIX } from '../../shared/constants';
import { getLocalizedTextFromState } from '../utils';

//noinspection JSUnresolvedVariable
import defaultComponentLayoutIcon from '../img/layout_default.svg';

export const TOOL_ID_LIBRARY = 'componentsLibrary';
export const TOOL_ID_COMPONENTS_TREE = 'componentsTree';
export const TOOL_ID_PROPS_EDITOR = 'componentPropsEditor';

export const DESIGN_TOOL_IDS = List([
  TOOL_ID_LIBRARY,
  TOOL_ID_COMPONENTS_TREE,
  TOOL_ID_PROPS_EDITOR,
]);

const LIBRARY_ICON = 'cubes';
const COMPONENTS_TREE_ICON = 'sitemap';
const PROPS_EDITOR_ICON = 'sliders';

const containerStyleSelector = createSelector(
  state => state.project.meta,

  meta => {
    const combinedStyle = Object.keys(meta).reduce(
      (acc, cur) => Object.assign(acc, meta[cur].containerStyle || {}),
      {},
    );

    return Object.keys(combinedStyle)
      .map(prop => `${prop}:${combinedStyle[prop]}`)
      .join(';');
  },
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
    
    const initialAccumulator = {
      ret: List(),
      components: project.routes.get(currentRouteId).components,
    };
    
    const reducer = (acc, cur) => {
      const component = acc.components.get(cur.componentId),
        title = component.title || component.name,
        componentMeta = getComponentMeta(component.name, meta),
        propName = getComponentPropName(componentMeta, cur.prop, language);
  
      return {
        ret: acc.ret.push(title, propName),
        components: cur.components,
      };
    };
    
    return nestedConstructors.reduceRight(reducer, initialAccumulator).ret;
  },
);

/* eslint-disable react/prop-types */
const NestedConstructorsBreadcrumbsItem = props => (
  <span className={props.className}>
    {props.children}
  </span>
);
/* eslint-enable react/prop-types */

class DesignRoute extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      confirmDeleteComponentDialogIsVisible: false,
    };

    this._handleToolTitleChange =
      this._handleToolTitleChange.bind(this);
    this._handleDeleteComponentButtonPress =
      this._handleDeleteComponentButtonPress.bind(this);
    this._handleDeleteComponentConfirm =
      this._handleDeleteComponentConfirm.bind(this);
    this._handleDeleteComponentCancel =
      this._handleDeleteComponentCancel.bind(this);
    this._handleConfirmDeleteComponentDialogClose =
      this._handleConfirmDeleteComponentDialogClose.bind(this);
    this._handleLayoutSelection =
      this._handleLayoutSelection.bind(this);
  }
  
  _getLibraryTool() {
    const { getLocalizedText } = this.props;
    
    return new ToolRecord({
      id: TOOL_ID_LIBRARY,
      icon: LIBRARY_ICON,
      name: getLocalizedText('componentsLibrary'),
      title: getLocalizedText('componentsLibrary'),
      sections: List([
        new ToolSectionRecord({
          name: '',
          component: ComponentsLibrary,
        }),
      ]),
      windowMinWidth: 360,
    });
  }
  
  _getTreeTool() {
    const { getLocalizedText } = this.props;
    
    return new ToolRecord({
      id: TOOL_ID_COMPONENTS_TREE,
      icon: COMPONENTS_TREE_ICON,
      name: getLocalizedText('elementsTree'),
      title: getLocalizedText('elementsTree'),
      sections: List([
        new ToolSectionRecord({
          name: '',
          component: ComponentsTreeView,
        }),
      ]),
    });
  }
  
  _getPropsEditorTool() {
    const {
      meta,
      components,
      singleComponentSelected,
      firstSelectedComponentId,
      getLocalizedText,
    } = this.props;
    
    const propsEditorSection = new ToolSectionRecord({
      name: 'General',
      component: ComponentPropsEditor,
    });
  
    let title = '';
    let subtitle = '';
    let mainButtons = List();
    let sections = List([propsEditorSection]);
  
    if (singleComponentSelected) {
      const selectedComponent = components.get(firstSelectedComponentId);
      const parentComponent = selectedComponent.parentId > -1
        ? components.get(selectedComponent.parentId)
        : null;
    
      const isRegion = parentComponent
        ? isCompositeComponent(parentComponent.name, meta)
        : false;
    
      title = selectedComponent.title;
      subtitle = selectedComponent.name;
    
      if (!isRegion) {
        if (!selectedComponent.isWrapper) {
          mainButtons = mainButtons.push(
            new ButtonRecord({
              text: getLocalizedText('common.delete'),
              onPress: this._handleDeleteComponentButtonPress,
            }),
          );
        }
      
        if (isCompositeComponent(selectedComponent.name, meta)) {
          sections = sections.push(
            new ToolSectionRecord({
              name: 'Regions',
              component: ComponentRegionsEditor,
            }),
          );
        }
      }
    } else {
      title = getLocalizedText('componentConfiguration');
    }
    
    return new ToolRecord({
      id: TOOL_ID_PROPS_EDITOR,
      icon: PROPS_EDITOR_ICON,
      name: getLocalizedText('componentConfiguration'),
      title,
      titleEditable: singleComponentSelected,
      titlePlaceholder: getLocalizedText('enterTitle'),
      subtitle,
      mainButtons,
      sections,
    });
  }
  
  _getTools() {
    const libraryTool = this._getLibraryTool();
    const treeTool = this._getTreeTool();
    const propsEditorTool = this._getPropsEditorTool();
    return List([List([libraryTool, treeTool, propsEditorTool])]);
  }

  /**
   *
   * @param {Object} tool
   * @param {string} newTitle
   * @private
   */
  _handleToolTitleChange(tool, newTitle) {
    if (tool.id === TOOL_ID_PROPS_EDITOR) {
      this.props.onRenameComponent(
        this.props.firstSelectedComponentId,
        newTitle,
      );
    }
  }

    /**
     *
     * @private
     */
  _handleDeleteComponentButtonPress() {
    this.setState({
      confirmDeleteComponentDialogIsVisible: true,
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
      confirmDeleteComponentDialogIsVisible: false,
    });
  }
  
  /**
   *
   * @param {number} layoutIdx
   * @private
   */
  _handleLayoutSelection({ layoutIdx }) {
    this.props.onSelectLayout(layoutIdx);
  }
  
  /**
   *
   * @return {?ReactElement}
   * @private
   */
  _renderLayoutSelectionDialogContent() {
    const {
      meta,
      language,
      selectingComponentLayout,
      draggedComponents,
    } = this.props;
    
    if (!selectingComponentLayout) return null;
  
    const draggedComponent = draggedComponents.get(0);
    const draggedComponentMeta = getComponentMeta(draggedComponent.name, meta);
  
    const items = draggedComponentMeta.layouts.map((layout, idx) => {
      const icon = layout.icon || defaultComponentLayoutIcon;
      const title = getString(draggedComponentMeta, layout.textKey, language);
      const subtitle = getString(
        draggedComponentMeta,
        layout.descriptionTextKey,
        language,
      );
    
      return (
        <ComponentLayoutSelectionItem
          key={String(idx)}
          image={icon}
          title={title}
          subtitle={subtitle}
          onSelect={this._handleLayoutSelection}
        />
      );
    });
  
    //noinspection JSValidateTypes
    return (
      <ComponentLayoutSelection>
        {items}
      </ComponentLayoutSelection>
    );
  }
  
  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderContent() {
    const {
      params,
      previewContainerStyle,
      nestedConstructorBreadcrumbs,
      haveNestedConstructor,
      getLocalizedText,
      onCancelConstructComponentForProp,
      onSaveComponentForProp,
    } = this.props;
  
    const src = `${URL_PREVIEW_PREFIX}/${params.projectName}/index.html`;
  
    const previewIFrame = (
      <PreviewIFrame
        interactive
        store={store}
        url={src}
        containerStyle={previewContainerStyle}
      />
    );
    
    // TODO: Prevent re-creation of PreviewIFrame on haveNestedConstructor change
    if (haveNestedConstructor) {
      const breadcrumbsItems = nestedConstructorBreadcrumbs
        .toArray()
        .map(item => ({ title: item }));
    
      //noinspection JSValidateTypes
      return (
        <Panel headerFixed spread height="auto" maxHeight="none">
          <Header>
            <HeaderRegion spread alignY="center">
              <HeaderTitle>
                <Breadcrumbs
                  items={breadcrumbsItems}
                  mode="light"
                  linkComponent={NestedConstructorsBreadcrumbsItem}
                />
              </HeaderTitle>
            </HeaderRegion>
            <HeaderRegion>
              <Button
                text={getLocalizedText('common.cancel')}
                light
                onPress={onCancelConstructComponentForProp}
              />
            
              <Button
                text={getLocalizedText('common.ok')}
                light
                onPress={onSaveComponentForProp}
              />
            </HeaderRegion>
          </Header>
        
          <PanelContent key="preview-panel-content">
            {previewIFrame}
          </PanelContent>
        </Panel>
      );
    } else {
      return (
        <Panel spread height="auto" maxHeight="none">
          <PanelContent key="preview-panel-content">
            {previewIFrame}
          </PanelContent>
        </Panel>
      );
    }
  }

  render() {
    const {
      linkingProp,
      selectingComponentLayout,
      getLocalizedText,
      onLinkPropCancel,
    } = this.props;
    
    const { confirmDeleteComponentDialogIsVisible } = this.state;

    const layoutSelectionDialogContent =
      this._renderLayoutSelectionDialogContent();

    const confirmDeleteDialogButtons = [{
      text: getLocalizedText('common.delete'),
      onPress: this._handleDeleteComponentConfirm,
    }, {
      text: getLocalizedText('common.cancel'),
      onPress: this._handleDeleteComponentCancel,
    }];
  
    const toolGroups = this._getTools();
    const content = this._renderContent();

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
          visible={selectingComponentLayout}
        >
          {layoutSelectionDialogContent}
        </Dialog>

        <Dialog
          title={getLocalizedText('deleteComponent')}
          backdrop
          minWidth={400}
          buttons={confirmDeleteDialogButtons}
          visible={confirmDeleteComponentDialogIsVisible}
          closeOnEscape
          closeOnBackdropClick
          onClose={this._handleConfirmDeleteComponentDialogClose}
          onEnterKeyPress={this._handleDeleteComponentConfirm}
        >
          {getLocalizedText('deleteThisComponentQuestion')}
        </Dialog>
        
        <Dialog
          title="Link attribute value"
          backdrop
          minWidth={420}
          paddingSize="none"
          visible={linkingProp}
          haveCloseButton
          onClose={onLinkPropCancel}
        >
          <LinkPropWindow />
        </Dialog>
      </Desktop>
    );
  }
}

DesignRoute.propTypes = {
  params: PropTypes.shape({
    projectName: PropTypes.string.isRequired,
  }).isRequired,
  components: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
  ),
  meta: PropTypes.object,
  previewContainerStyle: PropTypes.string,
  singleComponentSelected: PropTypes.bool,
  firstSelectedComponentId: PropTypes.number,
  selectingComponentLayout: PropTypes.bool,
  draggedComponents: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
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
  onLinkPropCancel: PropTypes.func,
};

const mapStateToProps = state => ({
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
  getLocalizedText: getLocalizedTextFromState(state),
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
    void dispatch(linkPropCancel()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DesignRoute);
