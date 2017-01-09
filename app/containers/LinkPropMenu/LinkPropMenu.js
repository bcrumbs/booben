/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
  DataList,
  DataItem,
} from '../../components/DataList/DataList';

import {
  currentComponentsSelector,
  singleComponentSelectedSelector,
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
} from '../../selectors';

import { linkWithOwnerProp } from '../../actions/project';
import ProjectComponentRecord from '../../models/ProjectComponent';
import { NestedConstructor } from '../../reducers/project';

import {
  getComponentMeta,
  isCompatibleType,
  getString,
  getPropTypedef,
  resolveTypedef,
  getNestedTypedef,
} from '../../utils/meta';

class LinkPropMenuComponent extends PureComponent {
  render() {
    if (
      !this.props.singleComponentSelected ||
      !this.props.linkingProp
    ) return null;

    const ownerComponent = this.props.topNestedConstructorComponent;

    if (ownerComponent) {
      // We're in a nested constructor
      // so we can link with owner component props
      const ownerMeta = getComponentMeta(
        ownerComponent.name,
        this.props.meta,
      );

      const ownerPropName = this.props.topNestedConstructor.prop,
        ownerPropMeta = ownerMeta.props[ownerPropName],
        ownerPropsMeta = ownerPropMeta.sourceConfigs.designer.props;

      const linkTargetComponent =
        this.props.components.get(this.props.linkingPropOfComponentId);

      const linkTargetComponentMeta = getComponentMeta(
        linkTargetComponent.name,
        this.props.meta,
      );

      const linkTargetPropTypedef = getNestedTypedef(
        getPropTypedef(
          linkTargetComponentMeta,
          this.props.linkingPropName,
        ),

        this.props.linkingPropPath,
      );

      const items = Object.keys(ownerPropsMeta)
        .filter(ownerPropName => {
          const ownerPropTypedef = resolveTypedef(
            ownerMeta,
            ownerPropsMeta[ownerPropName],
          );

          return isCompatibleType(ownerPropTypedef, linkTargetPropTypedef);
        })
        .map(ownerPropName => {
          const ownerPropMeta = ownerPropsMeta[ownerPropName];

          const title = getString(
            ownerMeta,
            ownerPropMeta.textKey,
            this.props.language,
          );

          const subtitle = getString(
            ownerMeta,
            ownerPropMeta.descriptionTextKey,
            this.props.language,
          );

          return (
            <DataItem
              key={ownerPropName}
              title={title || ownerPropName}
              subtitle={subtitle}
              type={ownerPropMeta.type}
              clickable
              arg={ownerPropName}
              onClick={this.props.onLinkWithOwnerProp}
            />
          );
        });

      return (
        <DataList>
          {items}
        </DataList>
      );
    } else {
            // TODO: Add UI for linking with server data
      return null;
    }
  }
}

LinkPropMenuComponent.propTypes = {
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
  topNestedConstructor: PropTypes.instanceOf(NestedConstructor).isRequired,
  topNestedConstructorComponent: PropTypes.instanceOf(
    ProjectComponentRecord,
  ).isRequired,
  language: PropTypes.string.isRequired,

  onLinkWithOwnerProp: PropTypes.func.isRequired,
};

LinkPropMenuComponent.displayName = 'LinkPropMenu';

const mapStateToProps = state => ({
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
