/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
  dragHandler
} from '../../hocs/dragHandler';

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

import {
    setExpandedGroups,
    focusComponent
} from '../../actions/components-library';

import { List } from 'immutable';

import { getLocalizedText } from '../../utils';
import { constructComponent } from '../../utils/meta';
import { objectForEach, pointIsInCircle } from '../../utils/misc';

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

        this.onFocusHandlersCache = {};
        this.componentGroups = extractGroupsDataFromMeta(props.meta);
        this.sortLanguage = '';

    }

    shouldComponentUpdate(nextProps) {
        return nextProps.selectedComponentIds !== this.props.selectedComponentIds ||
            nextProps.expandedGroups !== this.props.expandedGroups ||
            nextProps.focusedComponentName !== this.props.focusedComponentName ||
            nextProps.language !== this.props.language;
    }

    /**
     *
     * @param {string} componentName
     * @return {Function}
     * @private
     */
    _getOnFocusHandler(componentName) {
        return this.onFocusHandlersCache[componentName] || (
            this.onFocusHandlersCache[componentName] =
                this.props.onFocusComponent.bind(null, componentName)
        );
    }


    render() {
        const { getLocalizedText, focusedComponentName, language } = this.props;

        const accordionItems = List(this.componentGroups.map(group => {
            if (this.sortLanguage !== language) {
                group.components.sort((a, b) => {
                    const aText = a.text[language],
                        bText = b.text[language];

                    return aText < bText ? -1 : aText > bText ? 1 : 0;
                });
            }

            const items = group.components.map((c, idx) => (
                <ComponentTag
                    key={idx}
                    title={c.text[language]}
                    image={c.iconURL}
                    focused={focusedComponentName === c.fullName}
                    onFocus={this._getOnFocusHandler(c.fullName)}
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

        this.sortLanguage = language;

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
};

ComponentsLibraryComponent.propTypes = {
    meta: PropTypes.object,
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    expandedGroups: ImmutablePropTypes.setOf(PropTypes.string),
    focusedComponentName: PropTypes.string,
    language: PropTypes.string,
    getLocalizedText: PropTypes.func,

    onExpandedGroupsChange: PropTypes.func,
    onFocusComponent: PropTypes.func,
};

ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

const mapStateToProps = ({ project, componentsLibrary, app }) => ({
    meta: project.meta,
    selectedComponentIds: project.selectedItems,
    expandedGroups: componentsLibrary.expandedGroups,
    focusedComponentName: componentsLibrary.focusedComponentName,
    language: app.language,
    getLocalizedText: (...args) => getLocalizedText(app.localization, app.language, ...args)
});

const mapDispatchToProps = dispatch => ({
    onExpandedGroupsChange: groups => void dispatch(setExpandedGroups(groups)),
    onFocusComponent: componentName => void dispatch(focusComponent(componentName)),
});

export const ComponentsLibrary = connect(
    mapStateToProps,
    mapDispatchToProps
)(dragHandler(ComponentsLibraryComponent));
