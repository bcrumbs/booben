/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

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

import { List } from 'immutable';

import { getComponentById } from '../../models/Project';
import { getChildComponents } from '../../models/ProjectRoute';
import ProjectComponentRecord from '../../models/ProjectComponent';

import {
    currentSelectedComponentIdsSelector,
    currentComponentsSelector
} from '../../selectors';

import { getLocalizedText } from '../../utils';
import { canInsertComponent } from '../../utils/meta';
import { objectForEach } from '../../utils/misc';

//noinspection JSUnresolvedVariable
import defaultComponentIcon from '../../img/component_default.svg';

/**
 * @typedef {Object} LibraryComponentData
 * @property {string} name
 * @property {string} fullName
 * @property {Object<string, string>} text
 * @property {Object<string, string>} descriptionText
 * @property {string} iconURL
 */

/**
 * @typedef {Object} LibraryGroupData
 * @property {string} name
 * @property {string} namespace
 * @property {Object<string, string>} text
 * @property {Object<string, string>} descriptionText
 * @property {boolean} isDefault
 * @property {LibraryComponentData[]} components
 */

/**
 *
 * @param {Object} meta
 * @return {LibraryGroupData[]}
 */
const extractGroupsDataFromMeta = meta => {
    const groups = [],
        groupsByName = new Map();

    objectForEach(meta, libMeta => {
        objectForEach(libMeta.componentGroups, (groupData, groupName) => {
            const fullName = `${libMeta.namespace}.${groupName}`;

            const group = {
                name: fullName,
                namespace: libMeta.namespace,
                text: libMeta.strings[groupData.textKey],
                descriptionText: libMeta.strings[groupData.descriptionTextKey],
                isDefault: false,
                components: []
            };

            groups.push(group);
            groupsByName.set(fullName, group);
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

            let group;

            if (defaultGroup && !groupsByName.has(groupName)) {
                group = {
                    name: groupName,
                    namespace: libMeta.namespace,
                    text: null,
                    descriptionText: null,
                    isDefault: true,
                    components: []
                };

                groups.push(group);
                groupsByName.set(groupName, group);
            }
            else {
                group = groupsByName.get(groupName);
            }

            group.components.push({
                name: componentMeta.displayName,
                fullName: `${libMeta.namespace}.${componentMeta.displayName}`,
                text: componentMeta.strings[componentMeta.textKey],
                descriptionText: componentMeta.strings[componentMeta.descriptionTextKey],
                iconURL: componentMeta.icon || defaultComponentIcon
            });
        });
    });

    return groups;
};

class ComponentsLibraryComponent extends Component {
    constructor(props) {
        super(props);

        this.componentGroups = extractGroupsDataFromMeta(props.meta);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.language !== this.props.language) {
            this.componentGroups.forEach(group => {
                group.components.sort((a, b) => {
                    const aText = a.text[nextProps.language],
                        bText = b.text[nextProps.language];

                    return aText < bText ? -1 : aText > bText ? 1 : 0;
                });
            });
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.components !== this.props.components ||
            nextProps.selectedComponentIds !== this.props.selectedComponentIds ||
            nextProps.expandedGroups !== this.props.expandedGroups ||
            nextProps.showAllComponentsOnPalette !== this.props.showAllComponentsOnPalette ||
            nextProps.language !== this.props.language ||
            nextProps.draggingComponent !== this.props.draggingComponent ||
            nextProps.draggedComponents !== this.props.draggedComponents ||
            nextProps.draggedComponentId !== this.props.draggedComponentId;
    }

    render() {
        const {
            getLocalizedText,
            language,
            draggingComponent,
            draggedComponents,
            draggedComponentId,
            showAllComponentsOnPalette
        } = this.props;

        const focusedComponentName = draggingComponent
            ? draggedComponents.get(draggedComponentId > -1 ? draggedComponentId : 0).name
            : '';

        let groups = this.componentGroups,
            filteredBySelectedComponent = false;

        const willFilterBySelectedComponent =
            this.props.selectedComponentIds.size === 1 &&
            !showAllComponentsOnPalette;

        if (willFilterBySelectedComponent) {
            const selectedComponentId = this.props.selectedComponentIds.first(),
                selectedComponent = this.props.components.get(selectedComponentId);

            const childComponentNames = selectedComponent.children
                .map(childId => this.props.components.get(childId).name);

            groups = groups.map(group => {
                const components = group.components.filter(c => canInsertComponent(
                    c.fullName,
                    selectedComponent.name,
                    childComponentNames,
                    -1,
                    this.props.meta
                ));

                return Object.assign({}, group, { components });
            });

            filteredBySelectedComponent = true;
        }

        groups = groups.filter(group => group.components.length > 0);

        if (!groups.length) {
            if (filteredBySelectedComponent) {
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

        const accordionItems = List(groups.map(group => {
            const items = group.components.map((c, idx) => (
                <ComponentTag
                    key={idx}
                    title={c.text[language]}
                    image={c.iconURL}
                    focused={focusedComponentName === c.fullName}
                    onStartDrag={event => this._handleStartDragNewComponent(event, c)}
                />
            ));

            const title = group.isDefault
                ? `${group.namespace} - ${getLocalizedText('uncategorizedComponents')}`
                : `${group.namespace} - ${group.text[language]}`;

            return new AccordionItemRecord({
                id: group.name,
                title: title,
                content: (
                    <ComponentTagWrapper>
                        {items}
                    </ComponentTagWrapper>
                )
            })
        }));

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

ComponentsLibraryComponent.propTypes = {
    meta: PropTypes.object,
    components: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number
    ),
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    expandedGroups: ImmutablePropTypes.setOf(PropTypes.string),
    language: PropTypes.string,
    draggingComponent: PropTypes.bool,
    draggedComponents: ImmutablePropTypes.map,
    draggedComponentId: PropTypes.number,
    showAllComponentsOnPalette: PropTypes.bool,
    getLocalizedText: PropTypes.func,

    onExpandedGroupsChange: PropTypes.func,
    onShowAllComponents: PropTypes.func
};

ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

const mapStateToProps = state => ({
    meta: state.project.meta,
    components: currentComponentsSelector(state),
    selectedComponentIds: currentSelectedComponentIdsSelector(state),
    expandedGroups: state.componentsLibrary.expandedGroups,
    language: state.app.language,
    draggingComponent: state.project.draggingComponent,
    draggedComponents: state.project.draggedComponents,
    draggedComponentId: state.project.draggedComponentId,
    showAllComponentsOnPalette: state.project.showAllComponentsOnPalette,
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
