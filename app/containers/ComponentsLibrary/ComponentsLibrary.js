/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { createSelector } from 'reselect';

import {
  connectDragHandler
} from '../../hocs/connectDragHandler';

import {
    Accordion,
    AccordionItemRecord
} from '../../components/Accordion/Accordion';

import {
    BlockContentBox,
    BlockContentPlaceholder
} from '../../components/BlockContent/BlockContent';

import {
    ComponentTag,
    ComponentTagWrapper
} from '../../components/ComponentTag/ComponentTag';

import {
    setExpandedGroups,
    showAllComponents
} from '../../actions/components-library';

import { Button } from '@reactackle/reactackle';

import { List, Record, Map, OrderedMap } from 'immutable';

import {
    currentSelectedComponentIdsSelector,
    currentComponentsSelector
} from '../../selectors';

import { getLocalizedText } from '../../utils';
import { canInsertComponent } from '../../utils/meta';
import { objectForEach } from '../../utils/misc';

//noinspection JSUnresolvedVariable
import defaultComponentIcon from '../../img/component_default.svg';

const LibraryComponentData = Record({
    name: '',
    fullName: '',
    text: Map(),
    descriptionText: Map(),
    iconURL: ''
});

const LibraryGroupData = Record({
    name: '',
    namespace: '',
    text: Map(),
    descriptionText: Map(),
    isDefault: false,
    components: List()
});

const extractGroupsDataFromMeta = meta => {
    let groups = OrderedMap();

    objectForEach(meta, libMeta => {
        objectForEach(libMeta.componentGroups, (groupData, groupName) => {
            const fullName = `${libMeta.namespace}.${groupName}`;

            const libraryGroup = new LibraryGroupData({
                name: fullName,
                namespace: libMeta.namespace,
                text: Map(libMeta.strings[groupData.textKey]),
                descriptionText: Map(libMeta.strings[groupData.descriptionTextKey]),
                isDefault: false
            });

            groups = groups.set(fullName, libraryGroup);
        });

        objectForEach(libMeta.components, componentMeta => {
            if (componentMeta.hidden) return;

            let defaultGroup = false,
                groupName;

            if (!componentMeta.group) {
                defaultGroup = true;
                groupName = `${libMeta.namespace}.__default__`
            }
            else {
                groupName = `${libMeta.namespace}.${componentMeta.group}`
            }

            if (defaultGroup && !groups.has(groupName)) {
                const group = new LibraryGroupData({
                    name: groupName,
                    namespace: libMeta.namespace,
                    isDefault: true
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
                iconURL: componentMeta.icon || defaultComponentIcon
            });

            groups = groups.updateIn(
                [groupName, 'components'],
                components => components.push(libraryComponent)
            );
        });
    });

    return groups.toList().filter(group => !group.components.isEmpty());
};

const libraryGroupsSelector = createSelector(
    state => state.project.meta,
    extractGroupsDataFromMeta
);

const compareComponents = language => (a, b) => {
    const aText = a.text.get(language) || '',
        bText = b.text.get(language) || '';

    return aText < bText ? -1 : aText > bText ? 1 : 0;
};

const libraryGroupsSortedByLanguageSelector = createSelector(
    libraryGroupsSelector,
    state => state.app.language,

    (groups, language) =>
        groups.map(group =>
            group.update('components', components =>
                components.sort(compareComponents(language))
            )
        )
);

const libraryGroupsFilteredSelector = createSelector(
    libraryGroupsSortedByLanguageSelector,
    currentSelectedComponentIdsSelector,
    currentComponentsSelector,
    state => state.project.showAllComponentsOnPalette,
    state => state.project.meta,

    (groups, selectedComponentIds, components, showAllComponentsOnPalette, meta) => {
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
                        meta
                    ))
                )
            ).filter(group => !group.components.isEmpty()),

            filtered: true
        };
    }
);

class ComponentsLibraryComponent extends PureComponent {
    render() {
        const {
            getLocalizedText,
            language,
            draggingComponent,
            draggedComponents,
            draggedComponentId
        } = this.props;

        const focusedComponentName = draggingComponent
            ? draggedComponents.get(draggedComponentId > -1 ? draggedComponentId : 0).name
            : '';

        const { groups, filtered } = this.props.componentGroups;

        if (groups.isEmpty()) {
            if (filtered) {
                return (
                    <BlockContentPlaceholder
                        text={getLocalizedText('noComponentsCanBeInsertedInsideSelectedComponent')}
                    >
                        <Button
                            text={getLocalizedText('showAllComponents')}
                            onPress={this.props.onShowAllComponents}
                        />
                    </BlockContentPlaceholder>
                );
            }
            else {
                return (
                    <BlockContentPlaceholder
                        text={getLocalizedText('noComponentsInLibrary')}
                    />
                );
            }
        }

        const accordionItems = groups.map(group => {
            const items = group.components.map((c, idx) => (
                <ComponentTag
                    key={idx}
                    title={c.text.get(language)}
                    image={c.iconURL}
                    focused={focusedComponentName === c.fullName}
                    onStartDrag={event => this._handleStartDragNewComponent(event, c)}
                />
            ));

            const title = group.isDefault
                ? `${group.namespace} - ${getLocalizedText('uncategorizedComponents')}`
                : `${group.namespace} - ${group.text.get(language)}`;

            return new AccordionItemRecord({
                id: group.name,
                title: title,
                content: (
                    <ComponentTagWrapper>
                        {items}
                    </ComponentTagWrapper>
                )
            })
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

const ComponentGroupsType = PropTypes.shape({
    groups: ImmutablePropTypes.listOf(PropTypes.instanceOf(LibraryGroupData)),
    filtered: PropTypes.bool
});

ComponentsLibraryComponent.propTypes = {
    componentGroups: ComponentGroupsType,
    expandedGroups: ImmutablePropTypes.setOf(PropTypes.string),
    language: PropTypes.string,
    draggingComponent: PropTypes.bool,
    draggedComponents: ImmutablePropTypes.map,
    draggedComponentId: PropTypes.number,
    getLocalizedText: PropTypes.func,

    onExpandedGroupsChange: PropTypes.func,
    onShowAllComponents: PropTypes.func
};

ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

const mapStateToProps = state => ({
    componentGroups: libraryGroupsFilteredSelector(state),
    expandedGroups: state.componentsLibrary.expandedGroups,
    language: state.app.language,
    draggingComponent: state.project.draggingComponent,
    draggedComponents: state.project.draggedComponents,
    draggedComponentId: state.project.draggedComponentId,
    getLocalizedText: (...args) => getLocalizedText(state.app.localization, state.app.language, ...args)
});

const mapDispatchToProps = dispatch => ({
    onExpandedGroupsChange: groups => void dispatch(setExpandedGroups(groups)),
    onShowAllComponents: () => void dispatch(showAllComponents())
});

export const ComponentsLibrary = connectDragHandler(
  mapStateToProps,
  mapDispatchToProps
)(ComponentsLibraryComponent);
