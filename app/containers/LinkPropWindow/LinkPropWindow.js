/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Map } from 'immutable';

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
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
  availableDataContextsSelector,
} from '../../selectors';

import {
  linkWithOwnerProp,
  linkWithData,
  linkWithFunction,
  createFunction,
} from '../../actions/project';

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
  NestedConstructor,
  makeCurrentQueryArgsGetter,
  makeValueInfoGetter,
  PathStartingPoints,
} from '../../reducers/project';

import { getComponentMeta, isValidSourceForValue } from '../../utils/meta';
import { getLocalizedTextFromState } from '../../utils';

//noinspection JSUnresolvedVariable
const propTypes = {
  meta: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  projectFunctions: ImmutablePropTypes.map.isRequired,
  builtinFunctions: ImmutablePropTypes.map.isRequired,
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
  }).isRequired,
  availableDataContexts: PropTypes.arrayOf(PropTypes.shape({
    dataContext: PropTypes.arrayOf(PropTypes.string),
    typeName: PropTypes.string,
  })).isRequired,
  topNestedConstructor: PropTypes.instanceOf(NestedConstructor),
  topNestedConstructorComponent: PropTypes.instanceOf(
    ProjectComponentRecord,
  ),
  getCurrentQueryArgs: PropTypes.func.isRequired,
  getValueInfo: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onLinkWithOwnerProp: PropTypes.func.isRequired,
  onLinkWithData: PropTypes.func.isRequired,
  onLinkWithFunction: PropTypes.func.isRequired,
  onCreateFunction: PropTypes.func.isRequired,
};

const defaultProps = {
  topNestedConstructor: null,
  topNestedConstructorComponent: null,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  schema: state.project.schema,
  projectFunctions: state.project.data.functions,
  builtinFunctions: Map(), // TODO: Pass built-in functions here
  linkingPath: state.project.linkingPath,
  availableDataContexts: availableDataContextsSelector(state),
  topNestedConstructor: topNestedConstructorSelector(state),
  topNestedConstructorComponent: topNestedConstructorComponentSelector(state),
  getCurrentQueryArgs: makeCurrentQueryArgsGetter(state.project),
  getValueInfo: makeValueInfoGetter(state.project),
  language: state.project.languageForComponentProps,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onLinkWithOwnerProp: ({ propName }) =>
    void dispatch(linkWithOwnerProp(propName)),
  
  onLinkWithData: ({ dataContext, path, args }) =>
    void dispatch(linkWithData(dataContext, path, args)),
  
  onLinkWithFunction: ({ source, name, argValues }) =>
    void dispatch(linkWithFunction(source, name, argValues)),
  
  onCreateFunction: ({ name, title, description, args, returnType, code }) =>
    void dispatch(createFunction(
      name,
      title,
      description,
      args,
      returnType,
      code,
    )),
});

class LinkPropWindowComponent extends PureComponent {
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
  }
  
  /**
   *
   * @return {LinkSourceComponentItem[]}
   * @private
   */
  _getAvailableSources() {
    const {
      topNestedConstructor,
      availableDataContexts,
      linkingPath,
      getValueInfo,
    } = this.props;
    
    const { valueDef } = getValueInfo(linkingPath);
    const items = [];
    
    if (topNestedConstructor) {
      items.push({
        id: 'owner',
        title: 'Owner component', // TODO: Get string from i18n
      });
    }
    
    if (isValidSourceForValue(valueDef, 'data')) {
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
    this.setState({
      selectedSourceId: '',
      selectedSourceData: null,
    });
  }
  
  /**
   *
   * @param {string} propName
   * @private
   */
  _handleLinkWithOwnerProp({ propName }) {
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
    this.props.onLinkWithFunction({ source, name, argValues });
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
    this.props.onCreateFunction({
      name,
      title,
      description,
      args,
      returnType,
      code,
    });
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
      linkingPath,
      getValueInfo,
      topNestedConstructor,
      topNestedConstructorComponent,
      language,
    } = this.props;
    
    const ownerMeta = getComponentMeta(
      topNestedConstructorComponent.name,
      meta,
    );
    
    const ownerPropName = topNestedConstructor.prop;
    const { valueDef, userTypedefs } = getValueInfo(linkingPath);
    
    //noinspection JSValidateTypes
    return (
      <OwnerComponentPropSelection
        ownerMeta={ownerMeta}
        ownerPropName={ownerPropName}
        linkTargetValueDef={valueDef}
        userTypedefs={userTypedefs}
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
    const {
      schema,
      linkingPath,
      getValueInfo,
      getCurrentQueryArgs,
      getLocalizedText,
    } = this.props;
    
    const { valueDef, userTypedefs } = getValueInfo(linkingPath);
    const argValues = getCurrentQueryArgs(dataContext) || Map();
    
    //noinspection JSValidateTypes
    return (
      <DataSelection
        dataContext={dataContext}
        schema={schema}
        rootTypeName={rootTypeName}
        linkTargetValueDef={valueDef}
        userTypedefs={userTypedefs}
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
    const { schema } = this.props;
    const { selectedSourceId, selectedSourceData } = this.state;
    
    let content = null;
    
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
    
    return (
      <DataWindow>
        {content}
      </DataWindow>
    );
  }
}

LinkPropWindowComponent.propTypes = propTypes;
LinkPropWindowComponent.defaultProps = defaultProps;
LinkPropWindowComponent.displayName = 'LinkPropDialog';

export const LinkPropWindow = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LinkPropWindowComponent);
