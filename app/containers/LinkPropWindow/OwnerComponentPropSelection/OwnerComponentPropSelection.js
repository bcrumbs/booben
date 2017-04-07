/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { isEqualType } from '@jssy/types';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentNavigation,
  BlockBreadcrumbs,
} from '../../../components/BlockContent/BlockContent';

import {
  DataList,
  DataItem,
} from '../../../components/DataList/DataList';

import { getString } from '../../../utils/meta';
import { noop } from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  ownerMeta: PropTypes.object.isRequired,
  ownerPropName: PropTypes.string.isRequired,
  userTypedefs: PropTypes.object.isRequired,
  linkTargetValueDef: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  onReturn: PropTypes.func,
};

const defaultProps = {
  onSelect: noop,
  onReturn: noop,
};

export class OwnerComponentPropSelection extends PureComponent {
  constructor(props) {
    super(props);
    
    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleSelect = this._handleSelect.bind(this);
  }
  
  /**
   *
   * @param {number} index
   * @private
   */
  _handleBreadcrumbsClick({ index }) {
    if (index === 0) this.props.onReturn();
  }
  
  /**
   *
   * @param {string} propName
   * @private
   */
  _handleSelect({ id: propName }) {
    this.props.onSelect({ propName });
  }
  
  /**
   *
   * @return {{ title: string }[]}
   * @private
   */
  _getBreadcrumbsItems() {
    return [{
      title: 'Sources',
    }, {
      title: 'Owner component',
    }];
  }
  
  render() {
    const {
      ownerMeta,
      ownerPropName,
      linkTargetValueDef,
      userTypedefs,
      language,
    } = this.props;
    
    const ownerPropMeta = ownerMeta.props[ownerPropName];
    const ownerPropsMeta = ownerPropMeta.sourceConfigs.designer.props;
    const items = Object.keys(ownerPropsMeta)
      .filter(ownerPropName => isEqualType(
        ownerPropsMeta[ownerPropName],
        linkTargetValueDef,
        ownerMeta.types,
        userTypedefs,
      ))
      .map(ownerPropName => {
        const ownerPropMeta = ownerPropsMeta[ownerPropName];
      
        const title = getString(
          ownerMeta.strings,
          ownerPropMeta.textKey,
          language,
        );
      
        const description = getString(
          ownerMeta.strings,
          ownerPropMeta.descriptionTextKey,
          language,
        );
      
        return (
          <DataItem
            key={ownerPropName}
            id={ownerPropName}
            title={title || ownerPropName}
            description={description}
            type={ownerPropMeta.type}
            clickable
            arg={ownerPropName}
            onSelect={this._handleSelect}
          />
        );
      });
    
    const breadcrumbsItems = this._getBreadcrumbsItems();
  
    return (
      <BlockContent>
        <BlockContentNavigation>
          <BlockBreadcrumbs
            items={breadcrumbsItems}
            mode="dark"
            overflow
            onItemClick={this._handleBreadcrumbsClick}
          />
        </BlockContentNavigation>
      
        <BlockContentBox isBordered flex>
          <BlockContentBoxItem>
            <DataList>
              {items}
            </DataList>
          </BlockContentBoxItem>
        </BlockContentBox>
      </BlockContent>
    );
  }
}

OwnerComponentPropSelection.propTypes = propTypes;
OwnerComponentPropSelection.defaultProps = defaultProps;
OwnerComponentPropSelection.displayName = 'OwnerComponentPropSelection';
