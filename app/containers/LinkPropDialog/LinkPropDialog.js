/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
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
  getAllPossibleNestedContexts,
} from '../../selectors';

import { linkWithOwnerProp, linkPropCancel } from '../../actions/project';
import ProjectComponentRecord from '../../models/ProjectComponent';
import { NestedConstructor } from '../../reducers/project';
import { getNestedTypedef } from '../../../shared/types';
import { getComponentMeta, isValidSourceForProp } from '../../utils/meta';
import { getLocalizedTextFromState } from '../../utils';

class LinkPropDialogComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedSourceId: '',
      dialogButtons: [],
    };
    
    this._handleSelectSource = this._handleSelectSource.bind(this);
    this._handleReturn = this._handleReturn.bind(this);
    this._handleSelectOwnerProp = this._handleSelectOwnerProp.bind(this);
    this._handleReplaceDialogButtons =
      this._handleReplaceDialogButtons.bind(this);
  }
  
  _handleSelectSource({ id }) {
    this.setState({
      selectedSourceId: id,
      dialogButtons: [],
    });
  }
  
  _handleReturn() {
    this.setState({
      selectedSourceId: '',
      dialogButtons: [],
    });
  }
  
  _handleSelectOwnerProp({ id }) {
    this.props.onLinkWithOwnerProp(id);
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
    const { linkTargetPropTypedef } = this._getLinkTargetData();
    
    const items = [];
    
    if (this.props.topNestedConstructorComponent) {
      items.push({
        id: 'owner',
        title: 'Owner component', // TODO: Get string from i18n
      });
    }
    
    if (isValidSourceForProp(linkTargetPropTypedef, 'data')) {
      items.push({
        id: 'query',
        title: 'Query', // TODO: Get string from i18n
      });
      
      if (this.props.dataContexts) {
        // TODO: Add data contexts
        
        // this.props.dataContexts.forEach(ctx => {
        //
        // });
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
        onSelect={this._handleSelectOwnerProp}
        onReturn={this._handleReturn}
      />
    );
  }
  
  _renderQuerySelection() {
    const { schema, getLocalizedText } = this.props;
  
    const { linkTargetComponentMeta, linkTargetPropTypedef } =
      this._getLinkTargetData();
    
    return (
      <DataSelection
        schema={schema}
        rootTypeName={schema.queryTypeName}
        linkTargetComponentMeta={linkTargetComponentMeta}
        linkTargetPropTypedef={linkTargetPropTypedef}
        getLocalizedText={getLocalizedText}
        onReturn={this._handleReturn}
        onReplaceButtons={this._handleReplaceDialogButtons}
      />
    );
  }
  
  render() {
    const { singleComponentSelected, linkingProp } = this.props;
    const { selectedSourceId } = this.state;
    
    if (!singleComponentSelected || !linkingProp) return null;
    
    let content = null;

    if (!selectedSourceId)
      content = this._renderSourceSelection();
    else if (selectedSourceId === 'owner')
      content = this._renderOwnerPropSelection();
    else if (selectedSourceId === 'query')
      content = this._renderQuerySelection();
    
    return (
      <Dialog
        title="Link attribute value"
        backdrop
        minWidth={420}
        visible={this.props.linkingProp}
        haveCloseButton
        buttons={this.state.dialogButtons}
        onClose={this.props.onLinkPropCancel}
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
  dataContexts: PropTypes.array,
  components: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
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
  dataContexts: null,
  topNestedConstructor: null,
  topNestedConstructorComponent: null,
};

LinkPropDialogComponent.displayName = 'LinkPropDialog';

const mapStateToProps = state => ({
  dataContexts: getAllPossibleNestedContexts(state),
  components: currentComponentsSelector(state),
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
