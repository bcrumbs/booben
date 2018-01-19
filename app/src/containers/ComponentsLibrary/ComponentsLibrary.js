import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { createSelector } from 'reselect';
import _debounce from 'lodash.debounce';
import { Accordion } from '@reactackle/reactackle';
import { Button } from 'reactackle-button';

import {
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentPlaceholder,
} from '../../components/BlockContent';

import { AccordionItem } from './AccordionItem/AccordionItem';

import { SearchInput } from '../../components/SearchInput/SearchInput';
import { AccordionBox } from '../../components/AccordionBox/AccordionBox';

import {
  setExpandedGroups,
  showAllComponents,
  searchComponents,
} from '../../actions/components-library';

import {
  selectedComponentIdsSelector,
  currentComponentsSelector,
  currentRootComponentIdSelector,
  haveNestedConstructorsSelector,
  getLocalizedTextFromState,
  rootDraggedComponentSelector,
} from '../../selectors';

import { libraryGroupsSortedByLanguageSelector } from '../../selectors/library';
import LibraryGroupData from '../../models/LibraryGroupData';
import ProjectComponent from '../../models/ProjectComponent';
import { startDragNewComponent } from '../../actions/preview';
import { constructComponent } from '../../lib/meta';

import {
  getComponentNameString,
  getGroupNameString,
  filterGroupsAndComponents,
} from '../../lib/library';

import {
  findComponent,
  canInsertComponent,
  ANYWHERE,
} from '../../lib/components';

import { combineFiltersAll, mapListToArray } from '../../utils/misc';
import { LIBRARY_SEARCH_INPUT_DEBOUNCE } from '../../config';

const ComponentGroupsType = PropTypes.shape({
  groups: ImmutablePropTypes.listOf(PropTypes.instanceOf(LibraryGroupData)),
  filtered: PropTypes.bool,
});

const propTypes = {
  meta: PropTypes.object.isRequired,
  componentGroups: ComponentGroupsType.isRequired,
  expandedGroups: ImmutablePropTypes.setOf(PropTypes.string).isRequired,
  searchString: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  rootDraggedComponent: PropTypes.instanceOf(ProjectComponent),
  getLocalizedText: PropTypes.func.isRequired,
  onExpandedGroupsChange: PropTypes.func.isRequired,
  onSearchComponents: PropTypes.func.isRequired,
  onShowAllComponents: PropTypes.func.isRequired,
  onStartDragComponent: PropTypes.func.isRequired,
};

const defaultProps = {
  rootDraggedComponent: null,
};

const libraryGroupsFilteredSelector = createSelector(
  libraryGroupsSortedByLanguageSelector,
  selectedComponentIdsSelector,
  currentComponentsSelector,
  currentRootComponentIdSelector,
  haveNestedConstructorsSelector,
  state => state.project.showAllComponentsOnPalette,
  state => state.project.meta,
  state => state.componentsLibrary.searchString,
  state => state.app.language,
  getLocalizedTextFromState,

  (
    groups,
    selectedComponentIds,
    components,
    rootComponentId,
    haveNestedConstructors,
    showAllComponentsOnPalette,
    meta,
    searchString,
    language,
    getLocalizedText,
  ) => {
    const filterFns = [];

    const willHideOutlet =
      haveNestedConstructors ||
      findComponent(
        components,
        rootComponentId,
        component => component.name === 'Outlet',
      ) !== null;

    if (willHideOutlet) {
      filterFns.push(component => component.fullName !== 'Outlet');
    }

    if (selectedComponentIds.size === 1 && !showAllComponentsOnPalette) {
      const selectedComponentId = selectedComponentIds.first();

      filterFns.push(
        component => canInsertComponent(
          component.fullName,
          components,
          selectedComponentId,
          ANYWHERE,
          meta,
        ),
      );
    }

    if (searchString !== '') {
      filterFns.push(
        component =>
        getComponentNameString(component, language, getLocalizedText)
          .toLowerCase()
          .indexOf(searchString.toLowerCase()) !== -1,
      );
    }

    const filteredGroups =
      filterGroupsAndComponents(groups, combineFiltersAll(filterFns));

    return {
      groups: filteredGroups,
      filtered: true,
    };
  },
);

const mapStateToProps = state => ({
  meta: state.project.meta,
  componentGroups: libraryGroupsFilteredSelector(state),
  expandedGroups: state.componentsLibrary.expandedGroups,
  searchString: state.componentsLibrary.searchString,
  language: state.app.language,
  draggingComponent: state.project.draggingComponent,
  rootDraggedComponent: rootDraggedComponentSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onExpandedGroupsChange: groups =>
    void dispatch(setExpandedGroups(groups)),

  onSearchComponents: searchString =>
    void dispatch(searchComponents(searchString)),

  onShowAllComponents: () =>
    void dispatch(showAllComponents()),

  onStartDragComponent: components =>
    void dispatch(startDragNewComponent(components)),
});

const wrap = connect(mapStateToProps, mapDispatchToProps);

class ComponentsLibraryComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      localSearchString: props.searchString,
    };

    this._handleDragStart = this._handleDragStart.bind(this);
    this._handleSearchInputChange = this._handleSearchInputChange.bind(this);
    this._handleSearchButtonPress = this._handleSearchButtonPress.bind(this);
    this._handleExpandedItemsChange =
      this._handleExpandedItemsChange.bind(this);

    this._doSearchDebounced = _debounce(
      this._doSearch.bind(this),
      LIBRARY_SEARCH_INPUT_DEBOUNCE,
    );
  }

  _getFocusedComponentName() {
    const { draggingComponent, rootDraggedComponent } = this.props;
    return draggingComponent ? rootDraggedComponent.name : '';
  }

  _handleDragStart({ data }) {
    const { meta, language, onStartDragComponent } = this.props;

    const components = constructComponent(data.name, 0, language, meta);
    onStartDragComponent(components);
  }

  _doSearch() {
    const { onSearchComponents } = this.props;
    const { localSearchString } = this.state;

    onSearchComponents(localSearchString);
  }

  _handleSearchInputChange({ value }) {
    this.setState({
      localSearchString: value,
    }, this._doSearchDebounced);
  }

  _handleSearchButtonPress() {
    this._doSearch();
  }

  _handleExpandedItemsChange({ expandedItemIds }) {
    const { onExpandedGroupsChange } = this.props;
    onExpandedGroupsChange(expandedItemIds);
  }

  render() {
    const {
      componentGroups,
      expandedGroups,
      searchString,
      language,
      getLocalizedText,
      onShowAllComponents,
    } = this.props;

    const { localSearchString } = this.state;

    const focusedComponentName = this._getFocusedComponentName();
    const { groups, filtered } = componentGroups;

    if (groups.isEmpty()) {
      if (!filtered) {
        const noComponentsText =
          getLocalizedText('library.noComponentsInLibrary');

        return (
          <BlockContentPlaceholder text={noComponentsText} />
        );
      }

      if (searchString === '') {
        const noComponentsText =
          getLocalizedText('library.noComponentsAvailable');

        const showAllComponentsText =
          getLocalizedText('library.showAllComponents');

        return (
          <BlockContentPlaceholder text={noComponentsText}>
            <Button
              text={showAllComponentsText}
              onPress={onShowAllComponents}
              colorScheme="flatLight"
            />
          </BlockContentPlaceholder>
        );
      }
    }

    const accordionItems = mapListToArray(groups, group => ({
      id: group.name,
      title: getGroupNameString(group, language, getLocalizedText),
      contentBlank: true,
      content: (
        <AccordionItem
          getLocalizedText={getLocalizedText}
          language={language}
          components={group.components}
          focusedComponentName={focusedComponentName}
          onDragStart={this._handleDragStart}
        />
      ),
    }));

    const expandAll = searchString !== '';
    const expandedItemIds = expandAll
      ? accordionItems.map(item => item.id)
      : expandedGroups.toArray();

    return (
      <BlockContentBox isBordered flex>
        <BlockContentBoxItem blank>
          <SearchInput
            placeholder={getLocalizedText('library.search.placeholder')}
            value={localSearchString}
            onChange={this._handleSearchInputChange}
            onButtonPress={this._handleSearchButtonPress}
          />
        </BlockContentBoxItem>

        <BlockContentBoxItem blank isBordered hasScrollY>
          <AccordionBox>
            <Accordion
              single
              items={accordionItems}
              expandedItemIds={expandedItemIds}
              onChange={this._handleExpandedItemsChange}
            />
          </AccordionBox>
        </BlockContentBoxItem>
      </BlockContentBox>
    );
  }
}

ComponentsLibraryComponent.propTypes = propTypes;
ComponentsLibraryComponent.defaultProps = defaultProps;
ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

export const ComponentsLibrary = wrap(ComponentsLibraryComponent);
