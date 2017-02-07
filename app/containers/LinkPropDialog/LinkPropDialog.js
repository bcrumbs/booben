/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Dialog } from '@reactackle/reactackle';
import { getNestedTypedef } from '@jssy/types';

import {
  LinkSourceSelection,
} from './LinkSourceSelection/LinkSourceSelection';

import {
  OwnerComponentPropSelection,
} from './OwnerComponentPropSelection/OwnerComponentPropSelection';

import { DataSelection } from './DataSelection/DataSelection';
import { FunctionSelection } from './FunctionSelection/FunctionSelection';
import { DataWindow } from '../../components/DataWindow/DataWindow';

import {
  currentComponentsSelector,
  singleComponentSelectedSelector,
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
  availableDataContextsSelector,
} from '../../selectors';

import {
  linkWithOwnerProp,
  linkWithData,
  linkPropCancel,
} from '../../actions/project';

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
  NestedConstructor,
  makeCurrentQueryArgsGetter,
} from '../../reducers/project';

import { getComponentMeta, isValidSourceForProp } from '../../utils/meta';
import { getLocalizedTextFromState } from '../../utils';

class LinkPropDialogComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedSourceId: '',
      selectedSourceData: null,
    };
    
    this._handleSelectSource = this._handleSelectSource.bind(this);
    this._handleReturn = this._handleReturn.bind(this);
    this._handleLinkWithOwnerProp = this._handleLinkWithOwnerProp.bind(this);
    this._handleLinkWithData = this._handleLinkWithData.bind(this);
    this._handleLinkWithFunction = this._handleLinkWithFunction.bind(this);
    this._handleCreateFunction = this._handleCreateFunction.bind(this);
    this._handleDialogClose = this._handleDialogClose.bind(this);
  }
  
  /**
   *
   * @return {{linkTargetComponent: Object, linkTargetComponentMeta: ComponentMeta, linkTargetPropTypedef: JssyTypeDefinition}}
   * @private
   */
  _getLinkTargetData() {
    const {
      meta,
      components,
      linkingPropOfComponentId,
      linkingPropName,
      linkingPropPath,
    } = this.props;
    
    const linkTargetComponent = components.get(linkingPropOfComponentId);
    const linkTargetComponentMeta = getComponentMeta(
      linkTargetComponent.name,
      meta,
    );
    
    const linkTargetPropTypedef = getNestedTypedef(
      linkTargetComponentMeta.props[linkingPropName],
      linkingPropPath,
      linkTargetComponentMeta.types,
    );
    
    return {
      linkTargetComponent,
      linkTargetComponentMeta,
      linkTargetPropTypedef,
    };
  }
  
  _initState() {
    this.setState({
      selectedSourceId: '',
      selectedSourceData: null,
    });
  }
  
  /**
   *
   * @return {LinkSourceComponentItem[]}
   * @private
   */
  _getAvailableSources() {
    const { topNestedConstructor, availableDataContexts } = this.props;
    
    const { linkTargetPropTypedef } = this._getLinkTargetData();
    const items = [];
    
    if (topNestedConstructor) {
      items.push({
        id: 'owner',
        title: 'Owner component', // TODO: Get string from i18n
      });
    }
    
    if (isValidSourceForProp(linkTargetPropTypedef, 'data')) {
      items.push({
        id: 'query',
        title: 'Data', // TODO: Get string from i18n
      });
      
      availableDataContexts.forEach(({ dataContext, typeName }, idx) => {
        items.push({
          id: `context-${idx}`,
          title: `Context - ${typeName}`,
          data: {
            dataContext,
            rootTypeName: typeName,
          },
        });
      });
    }
    
    // TODO: Define rules on when to allow to use functions
    items.push({
      id: 'function',
      title: 'Function', // TODO: Get string from i18n
    });
    
    return items;
  }
  
  /**
   *
   * @param {string} id
   * @param {*} data
   * @private
   */
  _handleSelectSource({ id, data }) {
    this.setState({
      selectedSourceId: id,
      selectedSourceData: data,
    });
  }
  
  /**
   *
   * @private
   */
  _handleReturn() {
    this._initState();
  }
  
  /**
   *
   * @param {string} propName
   * @private
   */
  _handleLinkWithOwnerProp({ propName }) {
    this._initState();
    this.props.onLinkWithOwnerProp({ propName });
  }
  
  /**
   *
   * @param {string[]} dataContext
   * @param {string[]} path
   * @param {Immutable.Map<string, Object>} args
   * @private
   */
  _handleLinkWithData({ dataContext, path, args }) {
    this._initState();
    this.props.onLinkWithData({ dataContext, path, args });
  }
  
  /**
   *
   * @param {string} source
   * @param {string} name
   * @param {Immutable.Map<string, Object>} argValues
   * @private
   */
  _handleLinkWithFunction({ source, name, argValues }) {
    this._initState();
    // TODO: Dispatch action
  }
  
  /**
   *
   * @param {string} name
   * @param {string} title
   * @param {string} description
   * @param {Object[]} args
   * @param {string} returnType
   * @param {string} code
   * @private
   */
  _handleCreateFunction({ name, title, description, args, returnType, code }) {
    // TODO: Dispatch action
  }
  
  /**
   *
   * @private
   */
  _handleDialogClose() {
    this._initState();
    this.props.onLinkPropCancel();
  }
  
  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderSourceSelection() {
    const sourceItems = this._getAvailableSources();
    
    //noinspection JSValidateTypes
    return (
      <LinkSourceSelection
        items={sourceItems}
        onSelect={this._handleSelectSource}
      />
    );
  }
  
  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderOwnerPropSelection() {
    const {
      meta,
      topNestedConstructor,
      topNestedConstructorComponent,
      language,
    } = this.props;
    
    const ownerMeta = getComponentMeta(
      topNestedConstructorComponent.name,
      meta,
    );
    
    const ownerPropName = topNestedConstructor.prop;

    const {
      linkTargetComponentMeta,
      linkTargetPropTypedef,
    } = this._getLinkTargetData();
    
    //noinspection JSValidateTypes
    return (
      <OwnerComponentPropSelection
        ownerMeta={ownerMeta}
        ownerPropName={ownerPropName}
        linkTargetComponentMeta={linkTargetComponentMeta}
        linkTargetPropTypedef={linkTargetPropTypedef}
        language={language}
        onSelect={this._handleLinkWithOwnerProp}
        onReturn={this._handleReturn}
      />
    );
  }
  
  /**
   *
   * @param {string[]} dataContext
   * @param {string} rootTypeName
   * @return {ReactElement}
   * @private
   */
  _renderDataSelection(dataContext, rootTypeName) {
    const { schema, getCurrentQueryArgs, getLocalizedText } = this.props;
  
    const {
      linkTargetComponentMeta,
      linkTargetPropTypedef,
    } = this._getLinkTargetData();
    
    const argValues = getCurrentQueryArgs(dataContext) || Map();
    
    //noinspection JSValidateTypes
    return (
      <DataSelection
        dataContext={dataContext}
        schema={schema}
        rootTypeName={rootTypeName}
        linkTargetComponentMeta={linkTargetComponentMeta}
        linkTargetPropTypedef={linkTargetPropTypedef}
        argValues={argValues}
        getLocalizedText={getLocalizedText}
        onSelect={this._handleLinkWithData}
        onReturn={this._handleReturn}
      />
    );
  }
  
  _renderFunctionSelection() {
    const { projectFunctions, builtinFunctions, getLocalizedText } = this.props;

    return (
      <FunctionSelection
        projectFunctions={projectFunctions}
        builtinFunctions={builtinFunctions}
        getLocalizedText={getLocalizedText}
        onSelect={this._handleLinkWithFunction}
        onCreateFunction={this._handleCreateFunction}
        onReturn={this._handleReturn}
      />
    );
  }
  
  render() {
    const { schema, singleComponentSelected, linkingProp } = this.props;
    const { selectedSourceId, selectedSourceData } = this.state;
    
    const visible = singleComponentSelected && linkingProp;
    let content = null;

    if (visible) {
      if (!selectedSourceId) {
        content = this._renderSourceSelection();
      } else if (selectedSourceId === 'owner') {
        content = this._renderOwnerPropSelection();
      } else if (selectedSourceId === 'query') {
        content = this._renderDataSelection([], schema.queryTypeName);
      } else if (selectedSourceId === 'function') {
        content = this._renderFunctionSelection();
      } else if (selectedSourceId.startsWith('context')) {
        content = this._renderDataSelection(
          selectedSourceData.dataContext,
          selectedSourceData.rootTypeName,
        );
      }
    }
    
    return (
      <Dialog
        title="Link attribute value"
        backdrop
        minWidth={420}
        paddingSize="none"
        visible={visible}
        haveCloseButton
        onClose={this._handleDialogClose}
      >
        <DataWindow>
          {content}
        </DataWindow>
      </Dialog>
    );
  }
}

//noinspection JSUnresolvedVariable
LinkPropDialogComponent.propTypes = {
  components: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
  ).isRequired,
  meta: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  projectFunctions: ImmutablePropTypes.map.isRequired,
  builtinFunctions: ImmutablePropTypes.map.isRequired,
  singleComponentSelected: PropTypes.bool.isRequired,
  linkingProp: PropTypes.bool.isRequired,
  linkingPropOfComponentId: PropTypes.number.isRequired,
  linkingPropName: PropTypes.string.isRequired,
  linkingPropPath: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  ).isRequired,
  availableDataContexts: PropTypes.arrayOf(PropTypes.shape({
    dataContext: PropTypes.arrayOf(PropTypes.string),
    typeName: PropTypes.string,
  })).isRequired,
  topNestedConstructor: PropTypes.instanceOf(NestedConstructor),
  topNestedConstructorComponent: PropTypes.instanceOf(
    ProjectComponentRecord,
  ),
  getCurrentQueryArgs: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onLinkPropCancel: PropTypes.func.isRequired,
  onLinkWithOwnerProp: PropTypes.func.isRequired,
  onLinkWithData: PropTypes.func.isRequired,
};

LinkPropDialogComponent.defaultProps = {
  topNestedConstructor: null,
  topNestedConstructorComponent: null,
};

LinkPropDialogComponent.displayName = 'LinkPropDialog';

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  meta: state.project.meta,
  schema: state.project.schema,
  projectFunctions: state.project.data.functions,
  builtinFunctions: Map(), // TODO: Pass built-in functions here
  singleComponentSelected: singleComponentSelectedSelector(state),
  linkingProp: state.project.linkingProp,
  linkingPropOfComponentId: state.project.linkingPropOfComponentId,
  linkingPropName: state.project.linkingPropName,
  linkingPropPath: state.project.linkingPropPath,
  availableDataContexts: availableDataContextsSelector(state),
  topNestedConstructor: topNestedConstructorSelector(state),
  topNestedConstructorComponent: topNestedConstructorComponentSelector(state),
  getCurrentQueryArgs: makeCurrentQueryArgsGetter(state.project),
  language: state.project.languageForComponentProps,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onLinkPropCancel: () =>
    void dispatch(linkPropCancel()),
  onLinkWithOwnerProp: ({ propName }) =>
    void dispatch(linkWithOwnerProp(propName)),
  onLinkWithData: ({ dataContext, path, args }) =>
    void dispatch(linkWithData(dataContext, path, args)),
});

export const LinkPropDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LinkPropDialogComponent);
