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
    ComponentTag,
    ComponentTagWrapper
} from '../../components/ComponentTag/ComponentTag';

import { setExpandedGroups } from '../../actions/components-library';

import { List } from 'immutable';

/**
 *
 * @param {Immutable.Map} meta
 * @return {Object[]}
 */
const extractGroupsDataFromMeta = meta => {
    const groups = [],
        groupsByName = new Map();

    meta.forEach(lib => {
        const componentGroups = lib.get('componentGroups');

        componentGroups.forEach((groupData, groupName) => {
            const fullName = `${lib.get('namespace')}.${groupName}`;

            const group = {
                name: fullName,

                namespace: lib.get('namespace'),

                text: lib
                    .get('strings')
                    .get(groupData.get('textKey'))
                    .toJS(),

                descriptionText: lib
                    .get('strings')
                    .get(groupData.get('descriptionTextKey'))
                    .toJS(),

                isDefault: false,
                components: []
            };

            groups.push(group);
            groupsByName.set(fullName, group);
        });

        const components = lib.get('components');

        components.forEach(component => {
            let defaultGroup = false,
                groupName;

            if (!component.get('group')) {
                defaultGroup = true;
                groupName = `${lib.get('namespace')}.__default__`
            }
            else {
                groupName = `${lib.get('namespace')}.${component.get('group')}`
            }

            let group;

            if (defaultGroup && !groupsByName.has(groupName)) {
                group = {
                    name: groupName,
                    namespace: lib.get('namespace'),
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
                name: component.get('displayName'),

                text: component
                    .get('strings')
                    .get(component.get('textKey'))
                    .toJS(),

                descriptionText: component
                    .get('strings')
                    .get(component.get('descriptionTextKey'))
                    .toJS(),

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
            <Accordion
                single
                items={accordionItems}
                expandedItemIds={this.props.expandedGroups}
                onExpandedItemsChange={this.props.onExpandedGroupsChange}
            />
        );
    }
}

ComponentsLibraryComponent.propTypes = {
    meta: PropTypes.object,
    selectedComponentUids: ImmutablePropTypes.setOf(
        PropTypes.string
    ),
    language: PropTypes.string,
    onExpandedGroupsChange: PropTypes.func
};

ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

const mapStateToProps = state => ({
    meta: state.project.meta,
    selectedComponentUids: state.preview.selectedItems,
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
