/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { batchActions } from 'redux-batched-actions';
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

import {
  ComponentActionsEditor,
} from '../containers/ComponentActionsEditor/ComponentActionsEditor';

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
  linkDialogClose,
  updateQueryArgs,
  replaceJssyValue,
} from '../actions/project';

import {
  haveNestedConstructorsSelector,
  singleComponentSelectedSelector,
  firstSelectedComponentIdSelector,
  currentComponentsSelector,
} from '../selectors';

import { PathStartingPoints, makeValueInfoGetter } from '../reducers/project';

import {
  getComponentMeta,
  isCompositeComponent,
  getString,
  getComponentPropName,
  componentHasActions,
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

const propTypes = {
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
  linkingProp: PropTypes.bool.isRequired,
  linkingPath: PropTypes.shape({
    startingPoint: PropTypes.oneOf(
      Object.keys(PathStartingPoints).map(key => PathStartingPoints[key]),
    ),
    
    steps: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
    ),
  }),
  getValueInfo: PropTypes.func.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onRenameComponent: PropTypes.func.isRequired,
  onDeleteComponent: PropTypes.func.isRequired,
  onSelectLayout: PropTypes.func.isRequired,
  onSaveComponentForProp: PropTypes.func.isRequired,
  onCancelConstructComponentForProp: PropTypes.func.isRequired,
  onLinkPropCancel: PropTypes.func.isRequired,
  onLinkValue: PropTypes.func.isRequired,
};

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
      const componentId = cur.path.steps[0];
      const isSystemProp = cur.path.steps[1] === 'systemProps';
      const prop = cur.path.steps[2];
      const component = acc.components.get(componentId);
      const title = component.title || component.name;
      const componentMeta = getComponentMeta(component.name, meta);
      const propName = isSystemProp
        ? prop
        : getComponentPropName(componentMeta, prop, language);
  
      return {
        ret: acc.ret.push(title, propName),
        components: cur.components,
      };
    };
    
    return nestedConstructors.reduceRight(reducer, initialAccumulator).ret;
  },
);

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
  linkingPath: state.project.linkingPath,
  getValueInfo: makeValueInfoGetter(state.project),
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
  
  onLinkValue: (path, newValue, queryArgs) => {
    const actions = [
      replaceJssyValue(path, newValue),
    ];
  
    if (newValue.isLinkedWithData() && queryArgs) {
      const dataContext = newValue.getDataContext();
      actions.push(updateQueryArgs(dataContext, queryArgs));
    }
    
    actions.push(linkDialogClose());
    
    dispatch(batchActions(actions));
  },
  
  onLinkPropCancel: () =>
    void dispatch(linkDialogClose()),
});

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

    this._handleToolTitleChange = this._handleToolTitleChange.bind(this);
    this._handleDeleteComponentButtonPress =
      this._handleDeleteComponentButtonPress.bind(this);
    this._handleDeleteComponentConfirm =
      this._handleDeleteComponentConfirm.bind(this);
    this._handleDeleteComponentCancel =
      this._handleDeleteComponentCancel.bind(this);
    this._handleConfirmDeleteComponentDialogClose =
      this._handleConfirmDeleteComponentDialogClose.bind(this);
    this._handleLayoutSelection = this._handleLayoutSelection.bind(this);
    this._handleLinkValue = this._handleLinkValue.bind(this);
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
  
      const selectedComponentMeta =
        getComponentMeta(selectedComponent.name, meta);
      
      if (componentHasActions(selectedComponentMeta)) {
        sections = sections.push(
          new ToolSectionRecord({
            name: 'Actions',
            component: ComponentActionsEditor,
          }),
        );
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
   * @param {JssyValue} newValue
   * @param {Immutable.Map<string, JssyValue>} queryArgs
   * @private
   */
  _handleLinkValue({ newValue, queryArgs }) {
    const { linkingPath, onLinkValue } = this.props;
    onLinkValue(linkingPath, newValue, queryArgs);
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
      const title = getString(
        draggedComponentMeta.strings,
        layout.textKey,
        language,
      );
      
      const subtitle = getString(
        draggedComponentMeta.strings,
        layout.descriptionTextKey,
        language,
      );
    
      return (
        <ComponentLayoutSelectionItem
          key={String(idx)}
          layoutIdx={idx}
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
        
          <PanelContent key="preview-panel-content" flex>
            {previewIFrame}
          </PanelContent>
        </Panel>
      );
    } else {
      return (
        <Panel spread height="auto" maxHeight="none">
          <PanelContent key="preview-panel-content" flex>
            {previewIFrame}
          </PanelContent>
        </Panel>
      );
    }
  }

  render() {
    const {
      linkingProp,
      linkingPath,
      getValueInfo,
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
    
    let linkingValueDef = null;
    let linkingValueUserTypedefs = null;
    if (linkingProp) {
      const linkingValueInfo = getValueInfo(linkingPath);
      linkingValueDef = linkingValueInfo.valueDef;
      linkingValueUserTypedefs = linkingValueInfo.userTypedefs;
    }

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
          <LinkPropWindow
            valueDef={linkingValueDef}
            userTypedefs={linkingValueUserTypedefs}
            onLink={this._handleLinkValue}
          />
        </Dialog>
      </Desktop>
    );
  }
}

DesignRoute.displayName = 'DesignRoute';
DesignRoute.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DesignRoute);
