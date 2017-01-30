/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import _forOwn from 'lodash.forown';
import { Dialog } from '@reactackle/reactackle';

import {
  LinkSourceSelection,
} from './LinkSourceSelection/LinkSourceSelection';

import {
  OwnerComponentPropSelection,
} from './OwnerComponentPropSelection/OwnerComponentPropSelection';

import { DataSelection } from './DataSelection/DataSelection';
import { DataWindow } from '../../components/DataWindow/DataWindow';

import {
  currentComponentsSelector,
  singleComponentSelectedSelector,
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
  currentComponentsStackSelector,
} from '../../selectors';

import { linkWithOwnerProp, linkPropCancel } from '../../actions/project';
import ProjectComponentRecord from '../../models/ProjectComponent';
import { NestedConstructor } from '../../reducers/project';
import { getNestedTypedef } from '../../../shared/types';

import {
  getComponentMeta,
  isValidSourceForProp,
  findPropThatPushedDataContext,
} from '../../utils/meta';

import { getLocalizedTextFromState } from '../../utils';

class LinkPropDialogComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedSourceId: '',
      selectedSourceData: null,
      dialogButtons: [],
    };
    
    this._handleSelectSource = this._handleSelectSource.bind(this);
    this._handleReturn = this._handleReturn.bind(this);
    this._handleLinkWithOwnerProp = this._handleLinkWithOwnerProp.bind(this);
    this._handleLinkWithData = this._handleLinkWithData.bind(this);
    this._handleReplaceDialogButtons =
      this._handleReplaceDialogButtons.bind(this);
  }
  
  _handleSelectSource({ id, data }) {
    this.setState({
      selectedSourceId: id,
      selectedSourceData: data,
      dialogButtons: [],
    });
  }
  
  _handleReturn() {
    this.setState({
      selectedSourceId: '',
      selectedSourceData: null,
      dialogButtons: [],
    });
  }
  
  _handleLinkWithOwnerProp({ propName }) {
    this.props.onLinkWithOwnerProp(propName);
  }
  
  _handleLinkWithData({ dataContext, path, args }) {
    // TODO: Save changes to project
  }
  
  _handleReplaceDialogButtons({ buttons }) {
    this.setState({
      dialogButtons: buttons,
    });
  }

  _getLinkTargetData() {
    const linkTargetComponent =
      this.props.components.get(this.props.linkingPropOfComponentId);

    const linkTargetComponentMeta = getComponentMeta(
      linkTargetComponent.name,
      this.props.meta,
    );

    const linkTargetPropTypedef = getNestedTypedef(
      linkTargetComponentMeta.props[this.props.linkingPropName],
      this.props.linkingPropPath,
      linkTargetComponentMeta.types,
    );

    return {
      linkTargetComponent,
      linkTargetComponentMeta,
      linkTargetPropTypedef,
    };
  }
  
  _renderSourceSelection() {
    const {
      meta,
      topNestedConstructor,
      topNestedConstructorComponent,
      currentComponentsStack,
    } = this.props;
    
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
      
      if (topNestedConstructor) {
        // TODO: Collect data contexts info using the currentComponentsStack
        
        // const ownerComponent = topNestedConstructorComponent;
        // const ownerComponentMeta = getComponentMeta(ownerComponent.name, meta);
        // const ownerComponentDesignerPropMeta =
        //   ownerComponentMeta.props[topNestedConstructor.prop];
        //
        // _forOwn(
        //   ownerComponentDesignerPropMeta.sourceConfigs.designer.props,
        //   ownerPropMeta => {
        //     if (!ownerPropMeta.dataContext) return;
        //
        //     const dataContextOriginData = findPropThatPushedDataContext(
        //       ownerComponentMeta,
        //       ownerPropMeta.dataContext,
        //     );
        //
        //     if (!dataContextOriginData) return;
        //
        //     const dataContextOriginValue =
        //       ownerComponent.props.get(dataContextOriginData.propName);
        //
        //     if (
        //       dataContextOriginValue.source !== 'data' ||
        //       !dataContextOriginValue.sourceData.queryPath
        //     ) return;
        //
        //     console.log(dataContextOriginValue.sourceData.dataContext.toJS().concat(ownerPropMeta.dataContext));
        //   },
        // );
      }
    }
    
    if (isValidSourceForProp(linkTargetPropTypedef, 'function')) {
      items.push({
        id: 'function',
        title: 'Function', // TODO: Get string from i18n
      });
    }
    
    return (
      <LinkSourceSelection
        items={items}
        onSelect={this._handleSelectSource}
      />
    );
  }
  
  _renderOwnerPropSelection() {
    const ownerComponent = this.props.topNestedConstructorComponent,
      ownerMeta = getComponentMeta(ownerComponent.name, this.props.meta),
      ownerPropName = this.props.topNestedConstructor.prop;

    const { linkTargetComponentMeta, linkTargetPropTypedef } =
      this._getLinkTargetData();
    
    return (
      <OwnerComponentPropSelection
        ownerMeta={ownerMeta}
        ownerPropName={ownerPropName}
        linkTargetComponentMeta={linkTargetComponentMeta}
        linkTargetPropTypedef={linkTargetPropTypedef}
        language={this.props.language}
        onSelect={this._handleLinkWithOwnerProp}
        onReturn={this._handleReturn}
      />
    );
  }
  
  _renderDataSelection(dataContext, rootTypeName) {
    const { schema, getLocalizedText } = this.props;
  
    const {
      linkTargetComponent,
      linkTargetComponentMeta,
      linkTargetPropTypedef,
    } = this._getLinkTargetData();
    
    const argValues = linkTargetComponent.queryArgs.get('') || Map();
    
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
        onReplaceButtons={this._handleReplaceDialogButtons}
      />
    );
  }
  
  render() {
    const {
      schema,
      singleComponentSelected,
      linkingProp,
      onLinkPropCancel,
    } = this.props;
    
    const {
      selectedSourceId,
      selectedSourceData,
      dialogButtons,
    } = this.state;
    
    const visible = singleComponentSelected && linkingProp;
    
    let content = null;

    if (visible) {
      if (!selectedSourceId) {
        content = this._renderSourceSelection();
      } else if (selectedSourceId === 'owner') {
        content = this._renderOwnerPropSelection();
      } else if (selectedSourceId === 'query') {
        content = this._renderDataSelection([], schema.queryTypeName);
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
        visible={visible}
        haveCloseButton
        buttons={dialogButtons}
        onClose={onLinkPropCancel}
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
  currentComponentsStack: ImmutablePropTypes.listOf(
    PropTypes.instanceOf(ProjectComponentRecord),
  ).isRequired,
  meta: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
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
  topNestedConstructor: PropTypes.instanceOf(NestedConstructor),
  topNestedConstructorComponent: PropTypes.instanceOf(
    ProjectComponentRecord,
  ),
  language: PropTypes.string.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onLinkPropCancel: PropTypes.func.isRequired,
  onLinkWithOwnerProp: PropTypes.func.isRequired,
};

LinkPropDialogComponent.defaultProps = {
  topNestedConstructor: null,
  topNestedConstructorComponent: null,
};

LinkPropDialogComponent.displayName = 'LinkPropDialog';

const mapStateToProps = state => ({
  components: currentComponentsSelector(state),
  currentComponentsStack: currentComponentsStackSelector(state),
  meta: state.project.meta,
  schema: state.project.schema,
  singleComponentSelected: singleComponentSelectedSelector(state),
  linkingProp: state.project.linkingProp,
  linkingPropOfComponentId: state.project.linkingPropOfComponentId,
  linkingPropName: state.project.linkingPropName,
  linkingPropPath: state.project.linkingPropPath,
  topNestedConstructor: topNestedConstructorSelector(state),
  topNestedConstructorComponent: topNestedConstructorComponentSelector(state),
  language: state.project.languageForComponentProps,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onLinkPropCancel: () =>
    void dispatch(linkPropCancel()),
  onLinkWithOwnerProp: ownerPropName =>
    void dispatch(linkWithOwnerProp(ownerPropName)),
});

export const LinkPropDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LinkPropDialogComponent);
