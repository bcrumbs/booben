import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactackle-button';
import { Tabs } from 'reactackle-tabs';

import {
  BlockContent,
  BlockContentBox,
  BlockContentNavigation,
  BlockBreadcrumbs,
  BlockContentBoxItem,
} from '../../../../components/BlockContent';

import {
  DataList,
  DataItem,
} from '../../../../components/DataList/DataList';

import { FunctionSources } from '../../../../lib/functions';
import { noop, returnArg } from '../../../../utils/misc';
import { IconAdd } from '../../../../components/icons';

const FunctionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
});

const propTypes = {
  builtinFunctions: PropTypes.arrayOf(FunctionShape),
  projectFunctions: PropTypes.arrayOf(FunctionShape),
  getLocalizedText: PropTypes.func,
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  onReturn: PropTypes.func,
};

const defaultProps = {
  builtinFunctions: [],
  projectFunctions: [],
  getLocalizedText: returnArg,
  onSelect: noop,
  onAdd: noop,
  onReturn: noop,
};

const Sections = {
  BUILTIN: 0,
  PROJECT: 1,
};

export class FunctionsList extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      activeSection: Sections.BUILTIN,
    };

    this._handleBreadcrumbsClick = this._handleBreadcrumbsClick.bind(this);
    this._handleTabSelect = this._handleTabSelect.bind(this);
    this._handleFunctionSelect = this._handleFunctionSelect.bind(this);
  }

  _getBreadcrumbsItems() {
    const { getLocalizedText } = this.props;

    return [{
      title: getLocalizedText('linkDialog.sources'),
    }, {
      title: getLocalizedText('linkDialog.source.function'),
    }];
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



    return fns.lenght > 0 && (
      <BlockContentBoxItem>
        <DataList>
          {fns.map(fn => (
            <DataItem
              key={fn.id}
              id={fn.id}
              title={fn.name}
              description={fn.description}
              connection
              onSelect={this._handleFunctionSelect}
            />
          ))}
        </DataList>
      </BlockContentBoxItem>
    );
  }

  render() {
    const { getLocalizedText, onAdd } = this.props;
    const { activeSection } = this.state;

    const breadcrumbsItems = this._getBreadcrumbsItems();
    const list = this._renderList();

    let addButton = null;
    if (activeSection === Sections.PROJECT) {
      addButton = (
        <BlockContentBoxItem>
          <Button
            icon={<IconAdd />}
            text={getLocalizedText('linkDialog.function.create')}
            narrow
            onPress={onAdd}
          />
        </BlockContentBoxItem>
      );
    }

    const tabs = [
      { text: getLocalizedText('linkDialog.function.library') },
      { text: getLocalizedText('linkDialog.function.user') },
    ];

    return (
      <BlockContent>
        <BlockContentNavigation isBordered>
          <BlockBreadcrumbs
            items={breadcrumbsItems}
            colorScheme="dark"
            onItemClick={this._handleBreadcrumbsClick}
          />
        </BlockContentNavigation>

        <BlockContentNavigation isBordered>
          <Tabs
            tabs={tabs}
            selected={activeSection}
            colorScheme="dark"
            onChange={this._handleTabSelect}
          />
        </BlockContentNavigation>

        <BlockContentBox isBordered>
          {list}

          {addButton}
        </BlockContentBox>
      </BlockContent>
    );
  }
}

FunctionsList.propTypes = propTypes;
FunctionsList.defaultProps = defaultProps;
FunctionsList.displayName = 'FunctionsList';
