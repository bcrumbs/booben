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
    addComponentPropValue,
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
    resolveTypedef,
    isScalarType,
    getNestedTypedef,
    buildDefaultStaticValue
} from '../../utils/meta';

import { getLocalizedText } from '../../utils';
import { objectMap, objectSome } from '../../utils/misc';

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceIntValue = value => {
    let maybeRet = parseInt(value, 10);
    if (isNaN(maybeRet)) return 0;
    return maybeRet;
};

/**
 *
 * @param {string} value
 * @return {number}
 */
const coerceFloatValue = value => {
    let maybeRet = parseFloat(value);
    if (isNaN(maybeRet)) return 0.0;
    return maybeRet;
};

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

/**
 *
 * @param {TypeDefinition} propMeta
 * @param {Object} propValue - It is an {@link Immutable.Record} actually (see app/models/ProjectComponentProp.js)
 * @return {*}
 */
const transformValue = (propMeta, propValue) => {
    if (!propValue) return null;

    const isLinked = isLinkedProp(propValue);
    let value = null;

    if (!isLinked) {
        if (propValue.source === 'static') {
            if (isScalarType(propMeta)) {
                value = propValue.sourceData.value;
            }
            else if (propMeta.type === 'shape') {
                value = objectMap(propMeta.fields, (fieldMeta, fieldName) =>
                    transformValue(fieldMeta, propValue.sourceData.value.get(fieldName)));
            }
            else if (propMeta.type === 'object') {
                propValue.sourceData.value.map(nestedValue =>
                    transformValue(propMeta.ofType, nestedValue)).toJS();
            }
            else if (propMeta.type === 'arrayOf') {
                value = propValue.sourceData.value.map(nestedValue =>
                    transformValue(propMeta.ofType, nestedValue)).toJS();
            }
        }
        else if (propValue.source === 'designer') {
            // true if component exists, false otherwise
            if (propMeta.type === 'component')
                value = propValue.sourceData.rootId !== -1;
        }
    }

    return { value, isLinked };
};

/**
 *
 * @type {Object<string, string>}
 * @const
 */
const propTypeToView = {
    'string': 'input',
    'bool': 'toggle',
    'int': 'input',
    'float': 'input',
    'oneOf': 'list',
    'component': 'constructor',
    'shape': 'shape',
    'objectOn': 'object',
    'arrayOf': 'array',
    'object': 'empty',
    'array': 'empty',
    'func': 'empty'
};

class ComponentPropsEditorComponent extends PureComponent {
    constructor(props) {
        super(props);

        this._formatArrayItemLabel = this._formatArrayItemLabel.bind(this);
        this._formatObjectItemLabel = this._formatObjectItemLabel.bind(this);
    }

    _formatArrayItemLabel(index) {
        return `Item ${index}`; // TODO: Get string from i18n
    }

    _formatObjectItemLabel(key) {
        return key;
    }

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
            [],
            'static',
            { value: newValue }
        );
    }

    _handleStaticNestedValueChange(propName, where, index, newValue) {
        const componentId = this.props.selectedComponentIds.first();
        this.props.onPropValueChange(
            componentId,
            propName,
            [].concat(where, index),
            'static',
            { value: newValue }
        );
    }

    _handleAddValue(propName, where, index) {
        const componentId = this.props.selectedComponentIds.first(),
            component = this.props.components.get(componentId),
            componentMeta = getComponentMeta(component.name, this.props.meta),
            propMeta = componentMeta.props[propName],
            nestedPropMeta = getNestedTypedef(propMeta, where),
            newValueType = nestedPropMeta.ofType;

        const { source, sourceData } = buildDefaultStaticValue(
            componentMeta,
            newValueType,
            this.props.language
        );

        this.props.onAddPropValue(
            componentId,
            propName,
            where,
            index,
            source,
            sourceData
        );
    }

    _handleDeleteValue(propName, where, index) {

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

    _handleLinkNestedProp(propName, where, index) {

    }

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {ComponentPropMeta} propMeta
     * @return {boolean}
     * @private
     */
    _isPropLinkable(componentMeta, propMeta) {
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
     * @param {ComponentPropMeta} propMeta
     * @returns {PropsItemPropType}
     * @private
     */
    _propTypeFromMeta(componentMeta, propMeta) {
        // TODO: Memoize

        const name = getString(
            componentMeta,
            propMeta.textKey,
            this.props.language
        );

        const description = getString(
            componentMeta,
            propMeta.descriptionTextKey,
            this.props.language
        );

        const editable = propMeta.source.indexOf('static') > -1,
            linkable = this._isPropLinkable(componentMeta, propMeta);

        const propType = {
            label: name,
            type: propMeta.type, // TODO: Get string from i18n
            view: editable ? propTypeToView[propMeta.type] : 'empty',
            image: '',
            tooltip: description,
            linkable: linkable,
            transformValue: null,
            formatItemLabel: null
        };

        if (editable) {
            if (propMeta.type === 'int') {
                propType.transformValue = coerceIntValue;
            }
            else if (propMeta.type === 'float') {
                propType.transformValue = coerceFloatValue;
            }
            else if (propMeta.type === 'oneOf') {
                propType.options = propMeta.options.map(option => ({
                    value: option.value,
                    text: getString(
                        componentMeta,
                        option.textKey,
                        this.props.language
                    ) || option.textKey
                }));
            }
            else if (propMeta.type === 'shape') {
                propType.fields = objectMap(propMeta.fields, (fieldMeta, fieldName) =>
                    this._propTypeFromMeta(componentMeta, fieldMeta));
            }
            else if (propMeta.type === 'arrayOf') {
                propType.ofType = this._propTypeFromMeta(componentMeta, propMeta.ofType);
                propType.formatItemLabel = this._formatArrayItemLabel;
            }
            else if (propMeta.type === 'objectOf') {
                propType.ofType = this._propTypeFromMeta(componentMeta, propMeta.ofType);
                propType.formatItemLabel = this._formatObjectItemLabel;
            }
        }

        return propType;
    };

    /**
     *
     * @param {ComponentMeta} componentMeta
     * @param {string} propName
     * @param {Object} propValue
     * @returns {?ReactElement}
     * @private
     */
    _renderPropsItem(componentMeta, propName, propValue) {
        const { getLocalizedText } = this.props;

        const propMeta = componentMeta.props[propName],
            propType = this._propTypeFromMeta(componentMeta, propMeta),
            value = transformValue(propMeta, propValue);

        //noinspection JSValidateTypes
        return (
            <PropsItem
                key={propName}
                propType={propType}
                value={value}
                setComponentButtonText={getLocalizedText('setComponent')}
                editComponentButtonText={getLocalizedText('editComponent')}
                addButtonText={getLocalizedText('addValue')}
                onChange={this._handleStaticValueChange.bind(this, propName)}
                onChangeNested={this._handleStaticNestedValueChange.bind(this, propName)}
                onAddValue={this._handleAddValue.bind(this, propName)}
                onDeleteValue={this._handleDeleteValue.bind(this, propName)}
                onLink={this._handleLinkProp.bind(this, propName)}
                onLinkNested={this._handleLinkNestedProp(this, propName)}
            />
        );
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
    onAddPropValue: PropTypes.func,
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
    onPropValueChange: (componentId, propName, path, newSource, newSourceData) =>
        void dispatch(updateComponentPropValue(
            componentId,
            propName,
            path,
            newSource,
            newSourceData
        )),

    onAddPropValue: (componentId, propName, path, index, source, sourceData) =>
        void dispatch(addComponentPropValue(
            componentId,
            propName,
            path,
            index,
            source,
            sourceData
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
