/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

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

import ProjectComponentRecord from '../../models/ProjectComponent';

import {
    updateComponentPropValue,
    constructComponentForProp,
    linkProp
} from '../../actions/project';

import {
    currentComponentsSelector,
    currentSelectedComponentIdsSelector,
    topNestedConstructorSelector,
    topNestedConstructorComponentSelector
} from '../../selectors';

import {
    getString,
    getComponentMeta,
    isCompatibleType,
    resolveTypedef
} from '../../utils/meta';
import { getLocalizedText } from '../../utils';
import { objectSome } from '../../utils/misc';

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
 * @param {Object} propValue
 * @return {boolean}
 */
const isLinkedProp = propValue =>
    propValue.source === 'data' || (
        propValue.source === 'static' &&
        !!propValue.sourceData.ownerPropName
    );

const ownerComponentMetaSelector = createSelector(
    topNestedConstructorComponentSelector,
    state => state.project.meta,

    (ownerComponent, meta) => ownerComponent
        ? getComponentMeta(ownerComponent.name, meta)
        : null
);

const ownerPropsSelector = createSelector(
    topNestedConstructorSelector,
    ownerComponentMetaSelector,

    (topNestedConstructor, ownerComponentMeta) => {
        if (!ownerComponentMeta) return null;

        const ownerComponentProp = topNestedConstructor.prop,
            ownerComponentPropMeta = ownerComponentMeta.props[ownerComponentProp];

        return ownerComponentPropMeta.source.indexOf('designer') > -1
            ? ownerComponentPropMeta.sourceConfigs.designer.props || null
            : null;
    }
);


class ComponentPropsEditorComponent extends PureComponent {
    /**
     *
     * @param {string} propName
     * @private
     */
    _handleSetComponent(propName) {
        const componentId = this.props.selectedComponentIds.first();
        this.props.onConstructComponent(componentId, propName);
    }

    /**
     *
     * @param {string} propName
     * @param {*} newValue
     * @private
     */
    _handleStaticValueChange(propName, newValue) {
        const componentId = this.props.selectedComponentIds.first();
        this.props.onPropValueChange(
            componentId,
            propName,
            'static',
            { value: newValue }
        );
    }

    /**
     *
     * @param {string} propName
     * @private
     */
    _handleLinkProp(propName) {
        const componentId = this.props.selectedComponentIds.first();
        this.props.onLinkProp(componentId, propName);
    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @return {boolean}
     * @private
     */
    _isPropLinkable(componentMeta, propName) {
        const propMeta = componentMeta.props[propName];
        if (propMeta.source.indexOf('data') > -1) return true;
        if (!this.props.ownerProps) return false;

        const propTypedef = resolveTypedef(componentMeta, propMeta);

        return objectSome(this.props.ownerProps, ownerProp => {
            const ownerPropTypedef = resolveTypedef(
                this.props.ownerComponentMeta,
                ownerProp
            );

            return isCompatibleType(propTypedef, ownerPropTypedef);
        });
    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {ReactElement}
     * @private
     */
    _renderStringProp(componentMeta, propName, propValue) {
        const source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            value = getStaticStringValue(source, sourceData),
            propMeta = componentMeta.props[propName],
            isLinked = isLinkedProp(propValue),
            linkable = this._isPropLinkable(componentMeta, propName);

        const label =
            getString(componentMeta, propMeta.textKey, this.props.language) || propName;

        //noinspection JSValidateTypes
        return (
            <PropsItem
                key={propName}
                view="input"
                label={label}
                value={value}
                linkable={linkable}
                disabled={isLinked}
                onChange={this._handleStaticValueChange.bind(this, propName)}
                onLink={this._handleLinkProp.bind(this, propName)}
            />
        );
    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {ReactElement}
     * @private
     */
    _renderIntProp(componentMeta, propName, propValue) {
        const source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            value = getStaticIntValue(source, sourceData),
            propMeta = componentMeta.props[propName],
            isLinked = isLinkedProp(propValue),
            linkable = this._isPropLinkable(componentMeta, propName);

        const label =
            getString(componentMeta, propMeta.textKey, this.props.language) || propName;

        const onChange = newValue =>
            this._handleStaticValueChange(propName, coerceIntValue(newValue));

        return (
            <PropsItem
                key={propName}
                view="input"
                label={label}
                value={String(value)}
                linkable={linkable}
                disabled={isLinked}
                onChange={onChange}
                onLink={this._handleLinkProp.bind(this, propName)}
            />
        );
    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {ReactElement}
     * @private
     */
    _renderFloatProp(componentMeta, propName, propValue) {
        const source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            value = getStaticFloatValue(source, sourceData),
            propMeta = componentMeta.props[propName],
            isLinked = isLinkedProp(propValue),
            linkable = this._isPropLinkable(componentMeta, propName);

        const label =
            getString(componentMeta, propMeta.textKey, this.props.language) || propName;

        const onChange = newValue =>
            this._handleStaticValueChange(propName, coerceFloatValue(newValue));

        return (
            <PropsItem
                key={propName}
                view="input"
                label={label}
                value={String(value)}
                linkable={linkable}
                disabled={isLinked}
                onChange={onChange}
                onLink={this._handleLinkProp.bind(this, propName)}
            />
        );
    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {ReactElement}
     * @private
     */
    _renderBoolProp(componentMeta, propName, propValue) {
        const source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            value = getStaticBoolValue(source, sourceData),
            propMeta = componentMeta.props[propName],
            isLinked = isLinkedProp(propValue),
            linkable = this._isPropLinkable(componentMeta, propName);

        const label =
            getString(componentMeta, propMeta.textKey, this.props.language) || propName;

        return (
            <PropsItem
                key={propName}
                view="toggle"
                label={label}
                value={value}
                linkable={linkable}
                disabled={isLinked}
                onChange={this._handleStaticValueChange.bind(this, propName)}
                onLink={this._handleLinkProp.bind(this, propName)}
            />
        );
    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {ReactElement}
     * @private
     */
    _renderOneOfProp(componentMeta, propName, propValue) {
        const lang = this.props.language,
            source = propValue ? propValue.source : 'static',
            sourceData = propValue ? propValue.sourceData : null,
            propMeta = componentMeta.props[propName],
            value = getStaticOneOfValue(source, sourceData, propMeta.options),
            isLinked = isLinkedProp(propValue),
            linkable = this._isPropLinkable(componentMeta, propName);

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
                view="list"
                label={label}
                value={value}
                options={options}
                linkable={linkable}
                disabled={isLinked}
                onChange={this._handleStaticValueChange.bind(this, propName)}
                onLink={this._handleLinkProp.bind(this, propName)}
            />
        );
    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {ReactElement}
     * @private
     */
    _renderComponentProp(componentMeta, propName, propValue) {
        const { getLocalizedText } = this.props,
            lang = this.props.language,
            propMeta = componentMeta.props[propName];

        const label =
            getString(componentMeta, propMeta.textKey, lang) || propName;

        return (
            <PropsItem
                key={propName}
                view="constructor"
                label={label}
                setComponentButtonText={getLocalizedText('setComponent')}
                onChange={this._handleSetComponent.bind(this, propName)}
            />
        );
    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {?ReactElement}
     * @private
     */
    _renderPropsItem(componentMeta, propName, propValue) {
        const propMeta = componentMeta.props[propName];
        if (!propMeta) return null;

        switch (propMeta.type) {
            case 'string':
                return this._renderStringProp(componentMeta, propName, propValue);
            case 'int':
                return this._renderIntProp(componentMeta, propName, propValue);
            case 'float':
                return this._renderFloatProp(componentMeta, propName, propValue);
            case 'bool':
                return this._renderBoolProp(componentMeta, propName, propValue);
            case 'oneOf':
                return this._renderOneOfProp(componentMeta, propName, propValue);
            case 'component':
                return this._renderComponentProp(componentMeta, propName, propValue);
            default:
                return null;
        }
    }

    render() {
        const { getLocalizedText } = this.props;

        if (this.props.selectedComponentIds.size === 0) {
            return (
                <BlockContentPlaceholder
                    text={getLocalizedText('selectAComponent')}
                />
            );
        }

        if (this.props.selectedComponentIds.size > 1) {
            return (
                <BlockContentPlaceholder
                    text={getLocalizedText('multipleComponentsSelected')}
                />
            );
        }

        const componentId = this.props.selectedComponentIds.first(),
            component = this.props.components.get(componentId),
            componentMeta = getComponentMeta(component.name, this.props.meta);

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
                    text={getLocalizedText('thisComponentDoesntHaveEditableAttributes')}
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
    meta: PropTypes.any,
    components: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number
    ),
    selectedComponentIds: ImmutablePropTypes.setOf(PropTypes.number),
    language: PropTypes.string,
    ownerComponentMeta: PropTypes.object,
    ownerProps: PropTypes.object,
    getLocalizedText: PropTypes.func,

    onPropValueChange: PropTypes.func,
    onConstructComponent: PropTypes.func,
    onLinkProp: PropTypes.func
};

const mapStateToProps = state => ({
    meta: state.project.meta,
    components: currentComponentsSelector(state),
    selectedComponentIds: currentSelectedComponentIdsSelector(state),
    language: state.app.language,
    ownerComponentMeta: ownerComponentMetaSelector(state),
    ownerProps: ownerPropsSelector(state),
    getLocalizedText: (...args) => getLocalizedText(
        state.app.localization,
        state.app.language,
        ...args
    )
});

const mapDispatchToProps = dispatch => ({
    onPropValueChange: (componentId, propName, newSource, newSourceData) =>
        void dispatch(updateComponentPropValue(
            componentId,
            propName,
            newSource,
            newSourceData
        )),

    onConstructComponent: (componentId, propName) =>
        void dispatch(constructComponentForProp(
            componentId,
            propName
        )),

    onLinkProp: (componentId, propName) =>
        void dispatch(linkProp(componentId, propName))
});

export const ComponentPropsEditor = connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentPropsEditorComponent);
