/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// TODO: Get strings from i18n

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { getLocalizedText } from '../../utils';

import {
    PropsList,
    PropsItem
} from '../../components/PropsList/PropsList';

import {
    BlockContentBox,
    BlockContentBoxHeading,
    BlockContentBoxItem,
    BlockContentPlaceholder
} from '../../components/BlockContent/BlockContent';

import ProjectRecord from '../../models/Project';

import HTMLMeta from '../../meta/html';
import miscMeta from '../../meta/misc';

import { updateComponentPropValue } from '../../actions/project';

/**
 *
 * @param {Object} propMeta
 * @return {boolean}
 */
const isRenderableProp = propMeta =>
    propMeta.source.indexOf('static') > -1 ||
    propMeta.source.indexOf('data') > -1 || (
        propMeta.type === 'component' &&
        propMeta.source.indexOf('designer') > -1
    );

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceIntValue = value => {
    let maybeRet = parseInt(value, 10);
    if (isNaN(maybeRet) || !isFinite(maybeRet)) return 0;
    return maybeRet;
};

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceFloatValue = value => {
    let maybeRet = parseFloat(value);
    if (isNaN(maybeRet) || !isFinite(maybeRet)) return 0.0;
    return maybeRet;
};

/**
 *
 * @param {string} source
 * @param {Object} sourceData
 * @return {string}
 */
const getStaticStringValue = (source, sourceData) =>
    source === 'static' ? (sourceData ? sourceData.value : '') : '';

/**
 *
 * @param {string} source
 * @param {Object} sourceData
 * @return {number}
 */
const getStaticIntValue = (source, sourceData) =>
    source === 'static' ? (sourceData ? sourceData.value : 0) : 0;

/**
 *
 * @param {string} source
 * @param {Object} sourceData
 * @return {number}
 */
const getStaticFloatValue = (source, sourceData) =>
    source === 'static' ? (sourceData ? sourceData.value : 0.0) : 0.0;

/**
 *
 * @param {string} source
 * @param {Object} sourceData
 * @return {number}
 */
const getStaticBoolValue = (source, sourceData) =>
    source === 'static' ? (sourceData ? sourceData.value : false) : false;

/**
 *
 * @param {string} source
 * @param {Object} sourceData
 * @param {Object[]} options
 * @return {*}
 */
const getStaticOneOfValue = (source, sourceData, options) =>
    source === 'static'
        ? (sourceData ? sourceData.value : options[0].value)
        : options[0].value;

/**
 *
 * @param {Object} componentMeta
 * @param {string} id
 * @param {string} language
 * @return {?string}
 */
const getString = (componentMeta, id, language) => {
    if (!componentMeta.strings[id]) return null;
    return componentMeta.strings[id][language] || null;
};

class ComponentPropsEditorComponent extends Component {
    _getComponentsMeta(namespace) {
        if (!namespace) return miscMeta;
        if (namespace === 'HTML') return HTMLMeta;
        if (!this.props.meta[namespace]) return null;
        return this.props.meta[namespace].components;
    }

    _getComponent(componentId) {
        const componentIndexData = this.props.componentsIndex.get(componentId);

        // TODO: Print warning
        if (!componentIndexData) return null;

        const component = this.props.project.getIn(componentIndexData.path);

        // TODO: Print warning
        if (!component) return null;
        return component;
    }

    _getComponentMeta(component) {
        let [namespace, name] = component.name.split('.');
        if (!name) {
            name = namespace;
            namespace = null;
        }

        const componentsMeta = this._getComponentsMeta(namespace);

        // TODO: Print warning
        if (!componentsMeta) return null;

        const componentMeta = componentsMeta[name];

        // TODO: Print warning
        if (!componentMeta) return null;

        return componentMeta;
    }

    _handleStaticValueChange(propName, newValue) {
        const componentId = this.props.selectedComponentIds.first();
        this.props.onPropValueChange(
            componentId,
            propName,
            'static',
            { value: newValue }
        );
    }

    _renderStringProp(componentMeta, propName, propValue) {
        const source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            value = getStaticStringValue(source, sourceData),
            propMeta = componentMeta.props[propName],
            isLinked = source === 'data',
            linkable = propMeta.source.indexOf('data') > -1;

        const label =
            getString(componentMeta, propMeta.textKey, this.props.language) || propName;

        return (
            <PropsItem
                key={propName}
                type="input"
                label={label}
                value={value}
                linkable={linkable}
                disabled={isLinked}
                onChange={this._handleStaticValueChange.bind(this, propName)}
            />
        );
    }

    _renderIntProp(componentMeta, propName, propValue) {
        const source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            value = getStaticIntValue(source, sourceData),
            propMeta = componentMeta.props[propName],
            isLinked = source === 'data',
            linkable = propMeta.source.indexOf('data') > -1;

        const label =
            getString(componentMeta, propMeta.textKey, this.props.language) || propName;

        const onChange = newValue =>
            this._handleStaticValueChange(propName, coerceIntValue(newValue));

        return (
            <PropsItem
                key={propName}
                type="input"
                label={label}
                value={String(value)}
                linkable={linkable}
                disabled={isLinked}
                onChange={onChange}
            />
        );
    }

    _renderFloatProp(componentMeta, propName, propValue) {
        const source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            value = getStaticFloatValue(source, sourceData),
            propMeta = componentMeta.props[propName],
            isLinked = source === 'data',
            linkable = propMeta.source.indexOf('data') > -1;

        const label =
            getString(componentMeta, propMeta.textKey, this.props.language) || propName;

        const onChange = newValue =>
            this._handleStaticValueChange(propName, coerceFloatValue(newValue));

        return (
            <PropsItem
                key={propName}
                type="input"
                label={label}
                value={String(value)}
                linkable={linkable}
                disabled={isLinked}
                onChange={onChange}
            />
        );
    }

    _renderBoolProp(componentMeta, propName, propValue) {
        const source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            value = getStaticBoolValue(source, sourceData),
            propMeta = componentMeta.props[propName],
            isLinked = source === 'data',
            linkable = propMeta.source.indexOf('data') > -1;

        const label =
            getString(componentMeta, propMeta.textKey, this.props.language) || propName;

        return (
            <PropsItem
                key={propName}
                type="toggle"
                label={label}
                value={value}
                linkable={linkable}
                disabled={isLinked}
                onChange={this._handleStaticValueChange.bind(this, propName)}
            />
        );
    }

    _renderOneOfProp(componentMeta, propName, propValue) {
        const lang = this.props.language,
            source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            propMeta = componentMeta.props[propName],
            value = getStaticOneOfValue(source, sourceData, propMeta.options),
            isLinked = source === 'data',
            linkable = propMeta.source.indexOf('data') > -1;

        const label =
            getString(componentMeta, propMeta.textKey, lang) || propName;

        const options = propMeta.options.map(option => ({
            value: option.value,
            text: getString(componentMeta, option.textKey, lang) || option.textKey,
            disabled: false
        }));

        return (
            <PropsItem
                key={propName}
                type="list"
                label={label}
                value={value}
                options={options}
                linkable={linkable}
                disabled={isLinked}
                onChange={this._handleStaticValueChange.bind(this, propName)}
            />
        );
    }

    _renderComponentProp(componentMeta, propName, propValue) {
        // TODO: Render something
        return null;
    }

    _renderPropsItem(componentMeta, propName, value) {
        const propMeta = componentMeta.props[propName];
        if (!propMeta) return null;

        switch (propMeta.type) {
            case 'string':
                return this._renderStringProp(componentMeta, propName, value);
            case 'int':
                return this._renderIntProp(componentMeta, propName, value);
            case 'float':
                return this._renderFloatProp(componentMeta, propName, value);
            case 'bool':
                return this._renderBoolProp(componentMeta, propName, value);
            case 'oneOf':
                return this._renderOneOfProp(componentMeta, propName, value);
            case 'component':
                return this._renderComponentProp(componentMeta, propName, value);
            default:
                return null;
        }
    }

    render() {
        if (this.props.selectedComponentIds.size === 0) {
            return (
                <BlockContentPlaceholder text={ getLocalizedText('selectAComponent') }/>
            );
        }

        if (this.props.selectedComponentIds.size > 1) {
            return (
                <BlockContentPlaceholder text={ getLocalizedText('multipleComponentsSelected') }/>
            );
        }

        const componentId = this.props.selectedComponentIds.first(),
            component = this._getComponent(componentId),
            componentMeta = this._getComponentMeta(component);

        if (!componentMeta) return null;

        const propGroups = componentMeta.propGroups.map(groupData => ({
            name: groupData.name,

            title: getString(
                componentMeta,
                groupData.textKey,
                this.props.language
            ),

            props: []
        }));

        const propsByGroup = new Map();
        propGroups.forEach(group => void propsByGroup.set(group.name, group.props));

        const propsWithoutGroup = [];

        const renderablePropNames = Object.keys(componentMeta.props)
            .filter(propName => isRenderableProp(componentMeta.props[propName]));

        if (renderablePropNames.length === 0) {
            return (
                <BlockContentPlaceholder
                    text={ getLocalizedText('thisComponentDoesntHaveEditableAttributes') }
                />
            );
        }

        renderablePropNames.forEach(propName => {
            const propMeta = componentMeta.props[propName];
            if (propMeta.group) propsByGroup.get(propMeta.group).push(propName);
            else propsWithoutGroup.push(propName);
        });

        const content = [];

        propGroups.forEach((group, idx) => {
            content.push(
                <BlockContentBoxHeading key={2 * idx}>
                    {group.title}
                </BlockContentBoxHeading>
            );

            const controls = group.props.map(propName => this._renderPropsItem(
                componentMeta,
                propName,
                component.props.get(propName) || null
            ));

            content.push(
                <BlockContentBoxItem key={2 * idx + 1}>
                    <PropsList>
                        {controls}
                    </PropsList>
                </BlockContentBoxItem>
            );
        });

        if (propsWithoutGroup.length > 0) {
            const controls = propsWithoutGroup.map(propName => this._renderPropsItem(
                componentMeta,
                propName,
                component.props.get(propName) || null
            ));

            content.push(
                <BlockContentBoxItem key={2 * propGroups.length}>
                    <PropsList>
                        {controls}
                    </PropsList>
                </BlockContentBoxItem>
            );
        }

        return (
            <BlockContentBox isBordered>
                {content}
            </BlockContentBox>
        );
    }
}

ComponentPropsEditorComponent.propTypes = {
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    project: PropTypes.instanceOf(ProjectRecord),
    meta: PropTypes.any,
    componentsIndex: ImmutablePropTypes.map,
    language: PropTypes.string,

    onPropValueChange: PropTypes.func
};

const mapStateToProps = state => ({
    selectedComponentIds: state.preview.selectedItems,
    project: state.project.data,
    meta: state.project.meta,
    componentsIndex: state.project.componentsIndex,
    language: state.app.language,
    getLocalizedText(...args) { return getLocalizedText(state.app.localization, state.app.language, ...args) }
});

const mapDispatchToProps = dispatch => ({
    onPropValueChange: (componentId, propName, newSource, newSourceData) =>
        void dispatch(updateComponentPropValue(
            componentId,
            propName,
            newSource,
            newSourceData
        ))
});

export const ComponentPropsEditor = connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentPropsEditorComponent);
