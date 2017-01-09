/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
  DataList,
  DataItem,
} from '../../../components/DataList/DataList';

import {
  resolveTypedef,
  isCompatibleType,
  getString,
} from '../../../utils/meta';

import { noop } from '../../../utils/misc';

const propTypes = {
  ownerMeta: PropTypes.object.isRequired,
  ownerPropName: PropTypes.string.isRequired,
  linkTargetPropTypedef: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
};

const defaultProps = {
  onSelect: noop,
};

export const OwnerComponentPropSelection = ({
  ownerMeta,
  ownerPropName,
  linkTargetPropTypedef,
  language,
  onSelect,
}) => {
  const ownerPropMeta = ownerMeta.props[ownerPropName],
    ownerPropsMeta = ownerPropMeta.sourceConfigs.designer.props;
  
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
        language,
      );
      
      const subtitle = getString(
        ownerMeta,
        ownerPropMeta.descriptionTextKey,
        language,
      );
      
      return (
        <DataItem
          key={ownerPropName}
          id={ownerPropName}
          title={title || ownerPropName}
          subtitle={subtitle}
          type={ownerPropMeta.type}
          clickable
          arg={ownerPropName}
          onClick={onSelect}
        />
      );
    });
  
  return (
    <DataList>
      {items}
    </DataList>
  );
};

OwnerComponentPropSelection.displayName = 'OwnerComponentPropSelection';
OwnerComponentPropSelection.propTypes = propTypes;
OwnerComponentPropSelection.defaultProps = defaultProps;
