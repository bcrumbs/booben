/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
    Accordion,
    AccordionItemRecord
} from '../../components/Accordion/Accordion';

import {
    BlockContentBox
} from '../../components/BlockContent/BlockContent';

import {
    ComponentTag,
    ComponentTagWrapper
} from '../../components/ComponentTag/ComponentTag';

import { setExpandedGroups } from '../../actions/components-library';

import { List } from 'immutable';

import { objectForEach } from '../../utils/misc';

/**
 *
 * @param {Object} meta
 * @return {Object[]}
 */
const extractGroupsDataFromMeta = meta => {
    const groups = [],
        groupsByName = new Map();

    objectForEach(meta, lib => {
        const componentGroups = lib.componentGroups;

        objectForEach(componentGroups, (groupData, groupName) => {
            const fullName = `${lib.namespace}.${groupName}`;

            const group = {
                name: fullName,
                namespace: lib.namespace,
                text: lib.strings[groupData.textKey],
                descriptionText: lib.strings[groupData.descriptionTextKey],
                isDefault: false,
                components: []
            };

            groups.push(group);
            groupsByName.set(fullName, group);
        });

        const components = lib.components;

        objectForEach(components, component => {
            let defaultGroup = false,
                groupName;

            if (!component.group) {
                defaultGroup = true;
                groupName = `${lib.namespace}.__default__`
            }
            else {
                groupName = `${lib.namespace}.${component.group}`
            }

            let group;

            if (defaultGroup && !groupsByName.has(groupName)) {
                group = {
                    name: groupName,
                    namespace: lib.namespace,
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
                name: component.displayName,
                text: component.strings[component.textKey],
                descriptionText: component.strings[component.descriptionTextKey],
                iconURL: null
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

    render() {
        const accordionItems = List(this.componentGroups.map(group => {
            const items = group.components
                .sort((a, b) => {
                    const aText = a.text[this.props.language],
                        bText = b.text[this.props.language];

                    return aText < bText ? -1 : aText > bText ? 1 : 0;
                })
                .map((c, idx) => (
                    <ComponentTag
                        key={idx}
                        title={c.text[this.props.language]}
                    />
                ));

            // TODO: Replace "Uncategorized" with a string from translations
            const title = group.isDefault
                ? `${group.namespace} - Uncategorized`
                : `${group.namespace} - ${group.text[this.props.language]}`;

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
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    language: PropTypes.string,
    onExpandedGroupsChange: PropTypes.func
};

ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

const mapStateToProps = state => ({
    meta: state.project.meta,
    selectedComponentIds: state.preview.selectedItems,
    expandedGroups: state.componentsLibrary.expandedGroups,
    language: state.app.language
});

const mapDispatchToProps = dispatch => ({
    onExpandedGroupsChange: groups => void dispatch(setExpandedGroups(groups))
});

export const ComponentsLibrary = connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsLibraryComponent);
