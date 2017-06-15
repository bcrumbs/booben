/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { isEqualType } from '@jssy/types';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentNavigation,
  BlockBreadcrumbs,
} from '@jssy/common-ui';

import {
  DataList,
  DataItem,
} from '../../../components/DataList/DataList';

import { getString } from '../../../lib/meta';
import { noop, returnArg } from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  ownerComponentMeta: PropTypes.object.isRequired,
  ownerPropMeta: PropTypes.object.isRequired,
  userTypedefs: PropTypes.object,
  linkTargetValueDef: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  getLocalizedText: PropTypes.func,
  onSelect: PropTypes.func,
  onReturn: PropTypes.func,
};

const defaultProps = {
  userTypedefs: null,
  getLocalizedText: returnArg,
  onSelect: noop,
  onReturn: noop,
};

export class OwnerComponentPropSelection extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleSelect = this._handleSelect.bind(this);
  }
  
  /**
   *
   * @param {number} index
   * @private
   */
  _handleBreadcrumbsClick({ index }) {
    const { onReturn } = this.props;
    if (index === 0) onReturn();
  }
  
  /**
   *
   * @param {string} propName
   * @private
   */
  _handleSelect({ id: propName }) {
    const { onSelect } = this.props;
    onSelect({ propName });
  }
  
  /**
   *
   * @return {{ title: string }[]}
   * @private
   */
  _getBreadcrumbsItems() {
    const { getLocalizedText } = this.props;
    
    return [{
      title: getLocalizedText('linkDialog.sources'),
    }, {
      title: getLocalizedText('linkDialog.source.owner'),
    }];
  }
  
  render() {
    const {
      ownerComponentMeta,
      ownerPropMeta,
      linkTargetValueDef,
      userTypedefs,
      language,
    } = this.props;
    
    const ownerPropsMeta = ownerPropMeta.sourceConfigs.designer.props;
    const items = Object.keys(ownerPropsMeta)
      .filter(ownerPropName => isEqualType(
        ownerPropsMeta[ownerPropName],
        linkTargetValueDef,
        ownerComponentMeta.types,
        userTypedefs,
      ))
      .map(ownerPropName => {
        const ownerPropMeta = ownerPropsMeta[ownerPropName];
      
        const title = getString(
          ownerComponentMeta.strings,
          ownerPropMeta.textKey,
          language,
        );
      
        const description = getString(
          ownerComponentMeta.strings,
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
