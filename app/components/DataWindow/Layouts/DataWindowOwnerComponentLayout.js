/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {
    DataList,
    DataItem,
} from '../../../components/DataList/DataList';

import ProjectComponentRecord from '../../../models/ProjectComponent';
import { NestedConstructor } from '../../../reducers/project';

import {
    getComponentMeta,
    isCompatibleType,
    getString,
    getPropTypedef,
    resolveTypedef,
    getNestedTypedef,
} from '../../../utils/meta';

export class DataWindowOwnerComponentLayout extends PureComponent {

  render() {
    const ownerComponent = this.props.topNestedConstructorComponent;

        // We're in a nested constructor
        // so we can link with owner component props
    const ownerComponentMeta = getComponentMeta(
            ownerComponent.name,
            this.props.meta,
        );

    const ownerComponentPropName = this.props.topNestedConstructor.prop,
      ownerComponentPropMeta = ownerComponentMeta.props[ownerComponentPropName],
      ownerPropsMeta = ownerComponentPropMeta.sourceConfigs.designer.props;

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
                    ownerComponentMeta,
                    ownerPropsMeta[ownerPropName],
                );

              return isCompatibleType(ownerPropTypedef, linkTargetPropTypedef);
            })
            .map((ownerPropName, idx) => {
              const ownerPropMeta = ownerPropsMeta[ownerPropName];

              const title = getString(
                    ownerComponentMeta,
                    ownerPropMeta.textKey,
                    this.props.language,
                );

              const subtitle = getString(
                    ownerComponentMeta,
                    ownerPropMeta.descriptionTextKey,
                    this.props.language,
                );

              return (
                <DataItem
                  key={idx}
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
  }
}

DataWindowOwnerComponentLayout.propTypes = {
  backToMainLayout: PropTypes.func,
  setSelectedPath: PropTypes.func,

  components: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number,
    ),
  meta: PropTypes.object,
  singleComponentSelected: PropTypes.bool,
  linkingProp: PropTypes.bool,
  linkingPropOfComponentId: PropTypes.number,
  linkingPropName: PropTypes.string,
  linkingPropPath: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
    ),
  topNestedConstructor: PropTypes.instanceOf(NestedConstructor),
  topNestedConstructorComponent: PropTypes.instanceOf(ProjectComponentRecord),
  language: PropTypes.string,

  onLinkWithOwnerProp: PropTypes.func,
};

DataWindowOwnerComponentLayout.displayName = 'DataWindowOwnerComponentLayout';
