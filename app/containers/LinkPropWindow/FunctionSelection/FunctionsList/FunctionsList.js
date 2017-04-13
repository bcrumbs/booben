/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Tabs } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentNavigation,
  BlockBreadcrumbs,
  BlockContentBoxItem,
} from '../../../../components/BlockContent/BlockContent';

import {
  DataList,
  DataItem,
} from '../../../../components/DataList/DataList';

import { FunctionSources } from '../../../../utils/functions';
import { noop } from '../../../../utils/misc';

const FunctionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
});

const propTypes = {
  builtinFunctions: PropTypes.arrayOf(FunctionShape),
  projectFunctions: PropTypes.arrayOf(FunctionShape),
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  onReturn: PropTypes.func,
};

const defaultProps = {
  builtinFunctions: [],
  projectFunctions: [],
  onSelect: noop,
  onAdd: noop,
  onReturn: noop,
};

const Sections = {
  BUILTIN: 0,
  PROJECT: 1,
};

export class FunctionsList extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      activeSection: Sections.BUILTIN,
    };

    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleTabSelect = this._handleTabSelect.bind(this);
    this._handleFunctionSelect = this._handleFunctionSelect.bind(this);
  }

  _getBreadcrumbsItems() {
    return [{
      title: 'Sources',
    }, {
      title: 'Functions',
    }];
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
   * @private
   */
  _handleTabSelect({ value }) {
    const activeSection = value === 0 ? Sections.BUILTIN : Sections.PROJECT;
    this.setState({ activeSection });
  }

  /**
   *
   * @param {string} id
   * @private
   */
  _handleFunctionSelect({ id }) {
    const { activeSection } = this.state;
    const { onSelect } = this.props;

    const source = activeSection === Sections.BUILTIN
      ? FunctionSources.BUILTIN
      : FunctionSources.PROJECT;

    onSelect({ id, source });
  }

  /**
   *
   * @return {ReactElement[]}
   * @private
   */
  _renderList() {
    const { builtinFunctions, projectFunctions } = this.props;
    const { activeSection } = this.state;

    const fns = activeSection === Sections.BUILTIN
      ? builtinFunctions
      : projectFunctions;

    return fns.map(fn => (
      <DataItem
        key={fn.id}
        id={fn.id}
        title={fn.name}
        description={fn.description}
        connection
        actionType="jump"
        onSelect={this._handleFunctionSelect}
      />
    ));
  }

  render() {
    const { onAdd } = this.props;
    const { activeSection } = this.state;

    const breadcrumbsItems = this._getBreadcrumbsItems();
    const list = this._renderList();

    let addButton = null;
    if (activeSection === Sections.PROJECT) {
      addButton = (
        <BlockContentBoxItem>
          <Button
            icon="plus"
            text="Add new function"
            iconPosition="left"
            narrow
            onPress={onAdd}
          />
        </BlockContentBoxItem>
      );
    }
    
    const tabs = [
      { text: 'Library functions' },
      { text: 'User functions' },
    ];

    return (
      <BlockContent>
        <BlockContentNavigation isBordered>
          <BlockBreadcrumbs
            items={breadcrumbsItems}
            mode="dark"
            onItemClick={this._handleBreadcrumbsClick}
          />
        </BlockContentNavigation>

        <BlockContentNavigation isBordered>
          <Tabs
            tabs={tabs}
            selected={activeSection}
            colorMode="dark"
            onChange={this._handleTabSelect}
          />
        </BlockContentNavigation>

        <BlockContentBox isBordered>
          <BlockContentBoxItem>
            <DataList>
              {list}
            </DataList>
          </BlockContentBoxItem>

          {addButton}
        </BlockContentBox>
      </BlockContent>
    );
  }
}

FunctionsList.propTypes = propTypes;
FunctionsList.defaultProps = defaultProps;
FunctionsList.displayName = 'FunctionsList';
