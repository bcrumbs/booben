/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import {
  connectDragHandler
} from '../../hocs/connectDragHandler';

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

import { getComponentById } from '../../models/Project';
import { getChildComponents } from '../../models/ProjectRoute';

import { getLocalizedText } from '../../utils';
import { constructComponent, canInsertComponent } from '../../utils/meta';
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
        return nextProps.project !== this.props.project ||
            nextProps.selectedComponentIds !== this.props.selectedComponentIds ||
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

        let groups = this.componentGroups;

        if (this.props.selectedComponentIds.size === 1) {
            const selectedComponentId = this.props.selectedComponentIds.first();

            const selectedComponent = getComponentById(
                this.props.project,
                selectedComponentId
            );

            const route = this.props.project.routes.get(selectedComponent.routeId),
                childComponents = getChildComponents(route, selectedComponentId);

            const childComponentNames =
                childComponents.map(childComponent => childComponent.name);

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
        }

        groups = groups.filter(group => group.components.length > 0);

        const accordionItems = List(groups.map(group => {
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
    project: PropTypes.any,
    meta: PropTypes.object,
    currentRouteId: PropTypes.number,
    currentRouteIsIndexRoute: PropTypes.bool,
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
    project: project.data,
    meta: project.meta,
    currentRouteId: project.currentRouteId,
    currentRouteIsIndexRoute: project.currentRouteIsIndexRoute,
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

export const ComponentsLibrary = connectDragHandler(
  mapStateToProps,
  mapDispatchToProps
)(ComponentsLibraryComponent);
