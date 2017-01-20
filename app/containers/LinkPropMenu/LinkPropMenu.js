/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
  LinkSourceSelection,
} from './LinkSourceSelection/LinkSourceSelection';

import {
  OwnerComponentPropSelection,
} from './OwnerComponentPropSelection/OwnerComponentPropSelection';

import { DataWindow } from '../../components/DataWindow/DataWindow';

import {
  currentComponentsSelector,
  singleComponentSelectedSelector,
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
  getAllPossibleNestedContexts,
} from '../../selectors';

import { linkWithOwnerProp } from '../../actions/project';
import ProjectComponentRecord from '../../models/ProjectComponent';
import { NestedConstructor } from '../../reducers/project';
import { getNestedTypedef } from '../../../shared/types';
import { getComponentMeta, isValidSourceForProp } from '../../utils/meta';

class LinkPropMenuComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedSourceId: '',
    };
    
    this._handleSelectSource = this._handleSelectSource.bind(this);
    this._handleReturn = this._handleReturn.bind(this);
    this._handleSelectOwnerProp = this._handleSelectOwnerProp.bind(this);
  }
  
  _handleSelectSource({ id }) {
    this.setState({
      selectedSourceId: id,
    });
  }
  
  _handleReturn() {
    this.setState({
      selectedSourceId: '',
    });
  }
  
  _handleSelectOwnerProp({ id }) {
    this.props.onLinkWithOwnerProp(id);
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
  
  render() {
    if (
      !this.props.singleComponentSelected ||
      !this.props.linkingProp
    ) return null;
    
    let content = null;

    if (!this.state.selectedSourceId)
      content = this._renderSourceSelection();
    else if (this.state.selectedSourceId === 'owner')
      content = this._renderOwnerPropSelection();
    
    return (
      <DataWindow>
        {content}
      </DataWindow>
    );
  }
}

LinkPropMenuComponent.propTypes = {
  dataContexts: PropTypes.array,
  components: ImmutablePropTypes.mapOf(
    PropTypes.instanceOf(ProjectComponentRecord),
    PropTypes.number,
  ).isRequired,
  meta: PropTypes.object.isRequired,
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

  onLinkWithOwnerProp: PropTypes.func.isRequired,
};

LinkPropMenuComponent.defaultProps = {
  dataContexts: null,
  topNestedConstructor: null,
  topNestedConstructorComponent: null,
};

LinkPropMenuComponent.displayName = 'LinkPropMenu';

const mapStateToProps = state => ({
  dataContexts: getAllPossibleNestedContexts(state),
  components: currentComponentsSelector(state),
  meta: state.project.meta,
  singleComponentSelected: singleComponentSelectedSelector(state),
  linkingProp: state.project.linkingProp,
  linkingPropOfComponentId: state.project.linkingPropOfComponentId,
  linkingPropName: state.project.linkingPropName,
  linkingPropPath: state.project.linkingPropPath,
  topNestedConstructor: topNestedConstructorSelector(state),
  topNestedConstructorComponent: topNestedConstructorComponentSelector(state),
  language: state.project.languageForComponentProps,
});

const mapDispatchToProps = dispatch => ({
  onLinkWithOwnerProp: ownerPropName =>
    void dispatch(linkWithOwnerProp(ownerPropName)),
});

export const LinkPropMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LinkPropMenuComponent);
