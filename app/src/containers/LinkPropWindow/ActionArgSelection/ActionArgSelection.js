/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { isCompatibleType } from '@jssy/types';

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

const propTypes = {
  actionArgsMeta: PropTypes.arrayOf(PropTypes.object).isRequired,
  actionComponentMeta: PropTypes.object.isRequired,
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

export class ActionArgSelection extends PureComponent {
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
   * @param {string} id
   * @private
   */
  _handleSelect({ id }) {
    const { onSelect } = this.props;
    
    const argIdx = parseInt(id, 10);
    onSelect({ argIdx });
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
      title: getLocalizedText('linkDialog.source.actionArgs'),
    }];
  }
  
  render() {
    const {
      actionArgsMeta,
      actionComponentMeta,
      linkTargetValueDef,
      userTypedefs,
      language,
    } = this.props;
    
    const items = actionArgsMeta
      .filter(argMeta => isCompatibleType(
        linkTargetValueDef,
        argMeta,
        userTypedefs,
        actionComponentMeta.types || null,
      ))
      .map((argMeta, idx) => {
        const title = getString(
          actionComponentMeta.strings,
          argMeta.textKey,
          language,
        );
        
        const description = getString(
          actionComponentMeta.strings,
          argMeta.descriptionTextKey,
          language,
        );
        
        return (
          <DataItem
            key={String(idx)}
            id={String(idx)}
            title={title}
            description={description}
            type={argMeta.type}
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
            colorScheme="alt"
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

ActionArgSelection.propTypes = propTypes;
ActionArgSelection.defaultProps = defaultProps;
ActionArgSelection.displayName = 'ActionArgSelection';
