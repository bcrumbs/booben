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
    startDragComponent,
    toggleHighlighting
} from '../../actions/preview';

import { List } from 'immutable';

import { projectComponentToImmutable } from '../../models/ProjectComponent';

import { getComponentMeta } from '../../utils/meta';

import {
    objectForEach,
    pointIsInCircle
} from '../../utils/misc';

/**
 * 
 * @type {number}
 * @const
 */
const START_DRAG_THRESHOLD = 10;

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
                iconURL: '' // TODO: Put icon or placeholder URL here
            });
        });
    });

    return groups;
};

const buildComponentProps = (componentMeta, language) => {
    const ret = {};
    
    objectForEach(componentMeta.props, (propMeta, propName) => {
        if (propMeta.source.indexOf('static') > -1 && propMeta.sourceConfigs.static) {
            if (typeof propMeta.sourceConfigs.static.default !== 'undefined') {
                ret[propName] = {
                    source: 'static',
                    sourceData: {
                        value: propMeta.sourceConfigs.static.default
                    }
                };
            }
            else if (propMeta.sourceConfigs.static.defaultTextKey) {
                const key = propMeta.sourceConfigs.static.defaultTextKey,
                    translations = componentMeta.strings[key];

                ret[propName] = {
                    source: 'static',
                    sourceData: {
                        value: translations[language] || ''
                    }
                };
            }
        }
        else if (propMeta.source.indexOf('const') > -1 && propMeta.sourceConfigs.const) {
            if (typeof propMeta.sourceConfigs.const.value !== 'undefined') {
                ret[propName] = {
                    source: 'const',
                    sourceData: {
                        value: propMeta.sourceConfigs.const.value
                    }
                }
            }
        }
    });
    
    return ret;
};

class ComponentsLibraryComponent extends Component {
    constructor(props) {
        super(props);

        this.onFocusHandlersCache = {};
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

    /**
     * 
     * @param {string} componentName
     * @returns {Function}
     * @private
     */
    _getOnFocusHandler(componentName) {
        return this.onFocusHandlersCache[componentName] || (
            this.onFocusHandlersCache[componentName] =
                this.props.onFocusComponent.bind(null, componentName)
        );
    }

    /**
     * 
     * @param {LibraryComponentData} componentData
     * @returns {?ProjectComponent}
     * @private
     */
    _createComponent(componentData) {
        const componentMeta = getComponentMeta(componentData.fullName, this.props.meta);
        if (!componentMeta) return null;

        return projectComponentToImmutable({
            id: null,
            name: componentData.fullName,
            title: '',
            props: buildComponentProps(componentMeta, this.props.language),
            children: []
        });
    }

    /**
     *
     * @param {LibraryComponentData} componentData
     * @param {MouseEvent} event
     * @private
     */
    _handleStartDrag(componentData, event) {
        event.preventDefault();
        window.addEventListener('mousemove', this._handleMouseMove);
        this.willTryStartDrag = true;
        this.dragStartX = event.pageX;
        this.dragStartY = event.pageY;
        this.draggedComponentData = componentData;
    }

    /**
     *
     * @param {MouseEvent} event
     * @private
     */
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

                if (component) {
                    this.props.onComponentStartDrag(component);
                    this.props.onToggleHighlighting(false);
                }
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
    onComponentStartDrag: PropTypes.func,
    onToggleHighlighting: PropTypes.func
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
    onComponentStartDrag: component => void dispatch(startDragComponent(component)),
    onToggleHighlighting: enable => void dispatch(toggleHighlighting(enable))
});

export const ComponentsLibrary = connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentsLibraryComponent);
