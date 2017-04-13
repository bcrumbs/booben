/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { createSelector } from 'reselect';
import { List, Record, Map, OrderedMap } from 'immutable';
import _forOwn from 'lodash.forown';
import { Button } from '@reactackle/reactackle';
import { dragHandler } from '../../hocs/dragHandler';

import {
  Accordion,
  AccordionItemRecord,
} from '../../components/Accordion/Accordion';

import {
  BlockContentBox,
  BlockContentPlaceholder,
} from '../../components/BlockContent/BlockContent';

import {
  ComponentTag,
  ComponentTagWrapper,
} from '../../components/ComponentTag/ComponentTag';

import {
  setExpandedGroups,
  showAllComponents,
} from '../../actions/components-library';

import {
  currentSelectedComponentIdsSelector,
  currentComponentsSelector,
} from '../../selectors';

import { getLocalizedTextFromState } from '../../utils';
import { canInsertComponent } from '../../utils/meta';

//noinspection JSUnresolvedVariable
import defaultComponentIcon from '../../img/component_default.svg';

const LibraryComponentData = Record({
  name: '',
  fullName: '',
  text: Map(),
  descriptionText: Map(),
  iconURL: '',
});

const LibraryGroupData = Record({
  name: '',
  namespace: '',
  text: Map(),
  descriptionText: Map(),
  isDefault: false,
  components: List(),
});

const ComponentGroupsType = PropTypes.shape({
  groups: ImmutablePropTypes.listOf(PropTypes.instanceOf(LibraryGroupData)),
  filtered: PropTypes.bool,
});

const propTypes = {
  componentGroups: ComponentGroupsType.isRequired,
  expandedGroups: ImmutablePropTypes.setOf(PropTypes.string).isRequired,
  language: PropTypes.string.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  draggedComponents: ImmutablePropTypes.map,
  draggedComponentId: PropTypes.number.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onStartDragNewComponent: PropTypes.func.isRequired,
  onExpandedGroupsChange: PropTypes.func.isRequired,
  onShowAllComponents: PropTypes.func.isRequired,
};

const defaultProps = {
  draggedComponents: null,
};

const extractGroupsDataFromMeta = meta => {
  let groups = OrderedMap();

  _forOwn(meta, libMeta => {
    _forOwn(libMeta.componentGroups, (groupData, groupName) => {
      const fullName = `${libMeta.namespace}.${groupName}`;

      const libraryGroup = new LibraryGroupData({
        name: fullName,
        namespace: libMeta.namespace,
        text: Map(libMeta.strings[groupData.textKey]),
        descriptionText: Map(libMeta.strings[groupData.descriptionTextKey]),
        isDefault: false,
      });

      groups = groups.set(fullName, libraryGroup);
    });

    _forOwn(libMeta.components, componentMeta => {
      if (componentMeta.hidden) return;

      let defaultGroup = false,
        groupName;

      if (!componentMeta.group) {
        defaultGroup = true;
        groupName = `${libMeta.namespace}.__default__`;
      } else {
        groupName = `${libMeta.namespace}.${componentMeta.group}`;
      }

      if (defaultGroup && !groups.has(groupName)) {
        const group = new LibraryGroupData({
          name: groupName,
          namespace: libMeta.namespace,
          isDefault: true,
        });

        groups = groups.set(groupName, group);
      }

      const text = componentMeta.strings[componentMeta.textKey],
        description = componentMeta.strings[componentMeta.descriptionTextKey];

      const libraryComponent = new LibraryComponentData({
        name: componentMeta.displayName,
        fullName: `${libMeta.namespace}.${componentMeta.displayName}`,
        text: Map(text),
        descriptionText: Map(description),
        iconURL: componentMeta.icon || defaultComponentIcon,
      });

      groups = groups.updateIn(
        [groupName, 'components'],
        components => components.push(libraryComponent),
      );
    });
  });

  return groups.toList().filter(group => !group.components.isEmpty());
};

const libraryGroupsSelector = createSelector(
  state => state.project.meta,
  extractGroupsDataFromMeta,
);

const compareComponents = language => (a, b) => {
  const aText = a.text.get(language) || '',
    bText = b.text.get(language) || '';
  
  if (aText < bText) return -1;
  if (aText > bText) return 1;
  return 0;
};

const libraryGroupsSortedByLanguageSelector = createSelector(
  libraryGroupsSelector,
  state => state.app.language,

  (groups, language) =>
    groups.map(group =>
      group.update('components', components =>
        components.sort(compareComponents(language)),
      ),
    ),
);

const libraryGroupsFilteredSelector = createSelector(
  libraryGroupsSortedByLanguageSelector,
  currentSelectedComponentIdsSelector,
  currentComponentsSelector,
  state => state.project.showAllComponentsOnPalette,
  state => state.project.meta,

  (
    groups,
    selectedComponentIds,
    components,
    showAllComponentsOnPalette,
    meta,
  ) => {
    const willFilterBySelectedComponent =
      selectedComponentIds.size === 1 &&
      !showAllComponentsOnPalette;

    if (!willFilterBySelectedComponent) return { groups, filtered: false };

    const selectedComponentId = selectedComponentIds.first(),
      selectedComponent = components.get(selectedComponentId);

    const childComponentNames = selectedComponent.children
      .map(childId => components.get(childId).name);

    return {
      groups: groups.map(group =>
        group.update('components', components =>
          components.filter(c => canInsertComponent(
            c.fullName,
            selectedComponent.name,
            childComponentNames,
            -1,
            meta,
          )),
        ),
      ).filter(group => !group.components.isEmpty()),

      filtered: true,
    };
  },
);

const mapStateToProps = state => ({
  componentGroups: libraryGroupsFilteredSelector(state),
  expandedGroups: state.componentsLibrary.expandedGroups,
  language: state.app.language,
  draggingComponent: state.project.draggingComponent,
  draggedComponents: state.project.draggedComponents,
  draggedComponentId: state.project.draggedComponentId,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onExpandedGroupsChange: groups => void dispatch(setExpandedGroups(groups)),
  onShowAllComponents: () => void dispatch(showAllComponents()),
});

class ComponentsLibraryComponent extends PureComponent {
  _getFocusedComponentName() {
    const {
      draggingComponent,
      draggedComponents,
      draggedComponentId,
    } = this.props;
    
    if (draggingComponent) {
      const id = draggedComponentId > -1 ? draggedComponentId : 0;
      return draggedComponents.get(id).name;
    }
    
    return '';
  }
  
  render() {
    const {
      getLocalizedText,
      language,
    } = this.props;

    const focusedComponentName = this._getFocusedComponentName();

    const { groups, filtered } = this.props.componentGroups;

    if (groups.isEmpty()) {
      if (filtered) {
        const noComponentsText = getLocalizedText(
          'noComponentsCanBeInsertedInsideSelectedComponent',
        );
        
        const showAllComponentsText = getLocalizedText('showAllComponents');
        
        return (
          <BlockContentPlaceholder text={noComponentsText}>
            <Button
              text={showAllComponentsText}
              onPress={this.props.onShowAllComponents}
            />
          </BlockContentPlaceholder>
        );
      } else {
        const noComponentsText = getLocalizedText('noComponentsInLibrary');
        
        return (
          <BlockContentPlaceholder text={noComponentsText} />
        );
      }
    }

    const accordionItems = groups.map(group => {
      const items = group.components.map(component => (
        <ComponentTag
          key={component.fullName}
          title={component.text.get(language)}
          image={component.iconURL}
          focused={focusedComponentName === component.fullName}
          onStartDrag={
            event => this.props.onStartDragNewComponent(event, component)
          }
        />
      ));

      const title = group.isDefault
        ? `${group.namespace} - ${getLocalizedText('uncategorizedComponents')}`
        : `${group.namespace} - ${group.text.get(language)}`;

      return new AccordionItemRecord({
        id: group.name,
        title,
        content: (
          <ComponentTagWrapper>
            {items}
          </ComponentTagWrapper>
        ),
      });
    });

    return (
      <BlockContentBox isBordered>
        <Accordion
          single
          items={accordionItems}
          expandedItemIds={this.props.expandedGroups}
          onExpandedItemsChange={this.props.onExpandedGroupsChange}
        />
      </BlockContentBox>
    );
  }
}

ComponentsLibraryComponent.propTypes = propTypes;
ComponentsLibraryComponent.defaultProps = defaultProps;
ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

export const ComponentsLibrary = dragHandler(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ComponentsLibraryComponent),
);
