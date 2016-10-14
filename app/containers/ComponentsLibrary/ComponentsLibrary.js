/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// TODO: Get all strings from i18n

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

import {
    setExpandedGroups,
    focusComponent
} from '../../actions/components-library';

import {
    startDragComponent
} from '../../actions/preview';

import HTMLMeta from '../../meta/html';
import miscMeta from '../../meta/misc';

import { List } from 'immutable';

import { projectComponentToImmutable } from '../../models/ProjectComponent';

import {
    objectForEach,
    pointIsInCircle
} from '../../utils/misc';


const START_DRAG_THRESHOLD = 10;

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
                fullName: `${lib.namespace}.${component.displayName}`,
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

        this._onFocusHandlersCache = {};

        this.componentGroups = extractGroupsDataFromMeta(props.meta);

        this.willTryStartDrag = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.draggedComponentData = null;

        this._handleMouseMove = this._handleMouseMove.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.selectedComponentIds !== this.props.selectedComponentIds ||
            nextProps.expandedGroups !== this.props.expandedGroups ||
            nextProps.focusedComponentName !== this.props.focusedComponentName ||
            nextProps.language !== this.props.language;
    }

    _getOnFocusHandler(componentName) {
        return this._onFocusHandlersCache[componentName] || (
            this._onFocusHandlersCache[componentName] =
                this.props.onFocusComponent.bind(null, componentName)
        );
    }

    _getComponentMeta(fullName) {
        let [namespace, name] = fullName.split('.');
        if (!name) {
            name = namespace;
            namespace = '';
        }

        let components;
        if (namespace === '') {
            components = miscMeta.components;
        }
        else if (namespace === 'HTML') {
            components = HTMLMeta.components;
        }
        else {
            components = this.props.meta[namespace]
                ? this.props.meta[namespace].components
                : null;
        }

        return components ? (components[name] || null) : null;
    }

    _createComponent(componentData) {
        const componentMeta = this._getComponentMeta(componentData.fullName);
        if (!componentMeta) return null;

        const ret = {
            id: null,
            name: componentData.fullName,
            title: '',
            props: {},
            children: []
        };

        objectForEach(componentMeta.props, (propMeta, propName) => {
            if (propMeta.source.indexOf('static') > -1 && propMeta.sourceConfigs.static) {
                if (typeof propMeta.sourceConfigs.static.default !== 'undefined') {
                    ret.props[propName] = {
                        source: 'static',
                        sourceData: {
                            value: propMeta.sourceConfigs.static.default
                        }
                    };
                }
                else if (propMeta.sourceConfigs.static.defaultTextKey) {
                    const key = propMeta.sourceConfigs.static.defaultTextKey,
                        translations = componentMeta.strings[key];

                    ret.props[propName] = {
                        source: 'static',
                        sourceData: {
                            value: translations[this.props.language] || ''
                        }
                    };
                }
            }
            else if (propMeta.source.indexOf('const') > -1 && propMeta.sourceConfigs.const) {
                if (typeof propMeta.sourceConfigs.const.value !== 'undefined') {
                    ret.props[propName] = {
                        source: 'const',
                        sourceData: {
                            value: propMeta.sourceConfigs.const.value
                        }
                    }
                }
            }
        });

        return projectComponentToImmutable(ret);
    }

    _handleStartDrag(componentData, event) {
        event.preventDefault();

        window.addEventListener('mousemove', this._handleMouseMove);
        this.willTryStartDrag = true;
        this.dragStartX = event.pageX;
        this.dragStartY = event.pageY;
        this.draggedComponentData = componentData;
    }

    _handleMouseMove(event) {
        if (this.willTryStartDrag) {
            const willStartDrag = !pointIsInCircle(
                event.pageX,
                event.pageY,
                this.dragStartX,
                this.dragStartY,
                START_DRAG_THRESHOLD
            );

            if (willStartDrag) {
                this.willTryStartDrag = false;
                window.removeEventListener('mousemove', this._handleMouseMove);
                const component = this._createComponent(this.draggedComponentData);
                if (component) this.props.onComponentStartDrag(component);
            }
        }
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
                        focused={this.props.focusedComponentName === c.fullName}
                        onFocus={this._getOnFocusHandler(c.fullName)}
                        onStartDrag={this._handleStartDrag.bind(this, c)}
                    />
                ));

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
    expandedGroups: ImmutablePropTypes.setOf(PropTypes.string),
    focusedComponentName: PropTypes.string,
    language: PropTypes.string,

    onExpandedGroupsChange: PropTypes.func,
    onFocusComponent: PropTypes.func,
    onComponentStartDrag: PropTypes.func
};

ComponentsLibraryComponent.displayName = 'ComponentsLibrary';

const mapStateToProps = state => ({
    meta: state.project.meta,
    selectedComponentIds: state.preview.selectedItems,
    expandedGroups: state.componentsLibrary.expandedGroups,
    focusedComponentName: state.componentsLibrary.focusedComponentName,
    language: state.app.language
});

const mapDispatchToProps = dispatch => ({
    onExpandedGroupsChange: groups => void dispatch(setExpandedGroups(groups)),
    onFocusComponent: componentName => void dispatch(focusComponent(componentName)),

    onComponentStartDrag: component =>
        void dispatch(startDragComponent(component))
});

export const ComponentsLibrary = connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsLibraryComponent);
