'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';

import {
    Button,
    Input,
    SelectBox,
    Textarea,
    ToggleButton
} from '@reactackle/reactackle';

import { PropLabel } from './PropLabel/PropLabel';
import { PropImage } from './PropImage/PropImage';
import { PropTreeList } from './PropTreeList/PropTreeList';
import { PropTreeBreadcrumbs } from './PropTreeBreadcrumbs/PropTreeBreadcrumbs';

import { noop } from '../../../utils/misc';

/**
 * @typedef {Object} PropsItemPropTypeOption
 * @property {*} value
 * @property {string} text
 * @property {boolean} disabled
 */

/**
 * @typedef {Object} PropsItemPropType
 * @property {string} label
 * @property {string} type
 * @property {string} view
 * @property {string} image
 * @property {string} tooltip
 * @property {boolean} linkable
 * @property {PropsItemPropTypeOption[]} [options]
 * @property {Object<string, PropsItemPropType>} [fields]
 * @property {PropsItemPropType} [ofType]
 * @property {Function} [transformValue]
 */

/**
 * @typedef {Object} PropsItemValue
 * @property {*} value
 * @property {boolean} linked
 */

/**
 *
 * @param {PropsItemPropType} baseType
 * @param {string|number} index
 * @returns {PropsItemPropType}
 */
const getNestedType = (baseType, index) => {
    if (baseType.view === 'shape') {
        if (typeof index !== 'string') throw new Error('Shit happened');
        return baseType.fields[index];
    }
    else if (baseType.view === 'array') {
        if (typeof index !== 'number') throw new Error('Shit happened');
        return baseType.ofType;
    }
    else if (baseType.view === 'object') {
        if (typeof index !== 'string') throw new Error('Shit happened');
        return baseType.ofType;
    }
    else {
        throw new Error('Shit happened')
    }
};

/**
 *
 * @param {PropsItemPropType} propType
 * @param {(string|number)[]} path
 * @return {PropsItemPropType}
 */
const getTypeByPath = (propType, path) => path.reduce(getNestedType, propType);

/**
 *
 * @param {PropsItemValue} value
 * @param {string|number} index
 * @return {*}
 */
export const getNestedValue = (value, index) => value.value[index];

/**
 *
 * @param {PropsItemValue} value
 * @param {(string|number)[]} path
 * @return {*}
 */
export const getValueByPath = (value, path) => path.reduce(getNestedValue, value);

/**
 * @typedef {Object} PropsItemBreadcrumbsItem
 * @property {string} title
 * @property {string} subtitle
 */

/**
 *
 * @param {PropsItemPropType} rootPropType
 * @param {(string|number)[]} currentPath
 * @returns {PropsItemBreadcrumbsItem[]}
 */
const buildTreeBreadcrumbsItems = (rootPropType, currentPath) => {
    const ret = [];

    let currentType = rootPropType;

    for (let i = 0, l = currentPath.length; i < l; i++) {
        const nestedType = getNestedType(currentType, currentPath[i]);

        ret.push({
            title: currentType.view === 'shape'
                ? nestedType.label
                : currentPath[i],

            subtitle: nestedType.type
        });

        currentType = nestedType;
    }

    return ret;
};

export class PropsItem extends PureComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            isOpen: false,
            currentPath: []
        };

        this._handleOpen = this._handleOpen.bind(this);
        this._handleDelete = this._handleDelete.bind(this);
        this._handleAddValue = this._handleAddValue.bind(this);
        this._handleChange = this._handleChange.bind(this);
    }

    /**
     *
     * @private
     */
    _handleOpen() {
        if (this.props._secondary) {
            this.props._onOpen();
        }
        else {
            this.setState({
                isOpen: !this.state.isOpen,
                currentPath: []
            });
        }
    }

    /**
     *
     * @param {string|number} index
     * @private
     */
    _handleOpenInnerValue(index) {
        this.setState({
            currentPath: [...this.state.currentPath, index]
        });
    }

    /**
     *
     * @param {string|number} index
     * @private
     */
    _handleNestedValueLink(index) {
        this.props.onLinkNested(this.state.currentPath, index);
    }

    /**
     *
     * @param {string|number} index
     * @private
     */
    _handleDelete(index) {
        this.props.onDeleteValue(this.state.currentPath, index);
    }

    /**
     *
     * @private
     */
    _handleAddValue() {
        this.props.onAddValue(this.state.currentPath);
    }

    /**
     *
     * @param {string|number} index
     * @param {*} newValue
     * @private
     */
    _handleNestedValueChange(index, newValue) {
        const currentType = getTypeByPath(
            this.props.propType,
            [].concat(this.state.currentPath, index)
        );

        if (typeof currentType.transformValue === 'function')
            newValue = currentType.transformValue(newValue);

        this.props.onChangeNested(this.state.currentPath, index, newValue);
    }

    _handleChange(newValue) {
        if (typeof this.props.propType.transformValue === 'function')
            newValue = this.props.propType.transformValue(newValue);

        this.props.onChange(newValue);
    }

    _renderBreadcrumbs() {
        if (this.state.currentPath.length > 0) {
            const breadcrumbsItems = buildTreeBreadcrumbsItems(
                this.props.propType,
                this.state.currentPath
            );

            return (
                <PropTreeBreadcrumbs items={breadcrumbsItems}/>
            );
        }
        else {
            return null;
        }
    }

    _renderNestedItems() {
        const breadcrumbs = this._renderBreadcrumbs();

        const currentType = getTypeByPath(
            this.props.propType,
            this.state.currentPath
        );

        const currentValue = getValueByPath(
            this.props.value,
            this.state.currentPath
        );

        let childItems = null;
        if (currentType.view === 'shape') {
            childItems = Object.keys(currentType.fields).map((fieldName, idx) => (
                <PropsItem
                    key={idx}
                    propType={currentType.fields[fieldName]}
                    value={currentValue.value[fieldName]}
                    setComponentButtonText={this.props.setComponentButtonText}
                    addButtonText={this.props.addButtonText}
                    onChange={this._handleNestedValueChange.bind(this, fieldName)}
                    onLink={this._handleNestedValueLink.bind(this, fieldName)}
                    _secondary
                    _onOpen={this._handleOpenInnerValue.bind(this, fieldName)}
                />
            ));
        }
        else if (currentType.view === 'array') {
            childItems = currentValue.value.map((itemValue, idx) => (
                <PropsItem
                    key={idx}
                    propType={currentType.ofType}
                    value={itemValue}
                    setComponentButtonText={this.props.setComponentButtonText}
                    addButtonText={this.props.addButtonText}
                    onChange={this._handleNestedValueChange.bind(this, idx)}
                    onLink={this._handleNestedValueLink.bind(this, idx)}
                    _secondary
                    _deletable
                    _onOpen={this._handleOpenInnerValue.bind(this, idx)}
                    _onDelete={this._handleDelete.bind(this, idx)}
                />
            ));
        }
        else if (currentType.view === 'object') {
            childItems = Object.keys(currentValue.value).map((key, idx) => (
                <PropsItem
                    key={idx}
                    propType={currentType.ofType}
                    value={currentValue[key]}
                    setComponentButtonText={this.props.setComponentButtonText}
                    addButtonText={this.props.addButtonText}
                    onChange={this._handleNestedValueChange.bind(this, key)}
                    onLink={this._handleNestedValueLink.bind(this, key)}
                    _secondary
                    _deletable
                    _onOpen={this._handleOpenInnerValue.bind(this, key)}
                    _onDelete={this._handleDelete.bind(this, idx)}
                />
            ));
        }

        const canAddValues =
            currentType.view === 'array' ||
            currentType.view === 'object';

        return (
            <PropTreeList
                addButton={canAddValues}
                addButtonText={this.props.addButtonText}
            >
                {breadcrumbs}
                {childItems}
            </PropTreeList>
        );
    }
    
    render() {
        let className = 'prop-item',
            wrapperClassName = 'prop-item-wrapper';

        if (this.props.propType.view)
            className += ` prop-type-${this.props.propType.view}`;

        if (this.props._dimLabel) className += ' is-flat-array';

        if (this.state.isOpen) {
            wrapperClassName += ' sublevel-is-visible';
            className += ' sublevel-is-visible';
        }

        let label = null;
        if (this.props.propType.label) {
            label = (
                <PropLabel
                    label={this.props.propType.label}
                    type={this.props.propType.type}
                    tooltip={this.props.propType.tooltip}
                />
            );
        }

        let image = null;
        if (this.props.propType.image) {
            image = (
                <PropImage src={this.props.propType.image} />
            );

            wrapperClassName += ' has-image';
        }

        let actionsLeft = null;
        if (this.props._deletable) {
            actionsLeft = (
                <div className="prop_actions prop_actions-left">
                    <div className="prop_action prop_action-collapse">
                        <Button icon="times" onPress={this._handleDelete} />
                    </div>
                </div>
            );
        }

        let linkAction = null;
        if (this.props.propType.linkable) {
            linkAction = (
                <div className="prop_action prop_action-linking">
                    <Button icon="link" onPress={this.props.onLink}/>
                </div>
            );
        }

        let content = null,
            toggle = null,
            collapseAction = null,
            children = null;

        if (!this.props.value.isLinked) {
            if (this.props.propType.view === 'input') {
                content = (
                    <Input
                        value={this.props.value.value}
                        disabled={this.props.disabled}
                        onChange={this._handleChange}
                    />
                );
            }
            else if (this.props.propType.view === 'textarea') {
                content = (
                    <Textarea
                        value={this.props.value.value}
                        disabled={this.props.disabled}
                        onChange={this._handleChange}
                    />
                );
            }
            else if (this.props.propType.view === 'list') {
                content = (
                    <SelectBox
                        data={this.props.propType.options}
                        value={this.props.value.value}
                        disabled={this.props.disabled}
                        onSelect={this._handleChange}
                    />
                );
            }
            else if (this.props.propType.view === 'constructor') {
                const text = this.props.value.value
                    ? this.props.editComponentButtonText
                    : this.props.setComponentButtonText;

                content = (
                    <Button
                        kind="link"
                        text={text}
                        onPress={this._handleChange}
                    />
                );
            }

            if (this.props.propType.view === 'toggle') {
                toggle = (
                    <div className="prop_action prop_action-toggle">
                        <ToggleButton
                            checked={this.props.value.value}
                            disabled={this.props.disabled}
                            onCheck={this._handleChange}
                        />
                    </div>
                );
            }

            const isComplexValue =
                this.props.propType.view === 'shape' ||
                this.props.propType.view === 'object' ||
                this.props.propType.view === 'array';

            if (isComplexValue) {
                collapseAction = (
                    <div className="prop_action prop_action-collapse">
                        <Button
                            icon="chevron-right"
                            disabled={this.props.disabled}
                            onPress={this._handleOpen}
                        />
                    </div>
                );

                className += ' has-sublevel';
            }

            if (!this.props._secondary && this.state.isOpen)
                children = this._renderNestedItems();
        }
        else {
            // TODO: Render something for linked value
        }

        let actionsRight = null;
        if (toggle || linkAction || collapseAction) {
            actionsRight = (
                <div className="prop_actions prop_actions-right">
                    {toggle}
                    {collapseAction}
                    {linkAction}
                </div>
            );

            wrapperClassName += ' has-actions-right';
        }

        return (
            <div className={className}>
                <div className={wrapperClassName}>
                    {actionsLeft}
                    {image}

                    <div className="prop-item-content-box">
                        {label}
                        {content}
                    </div>

                    {actionsRight}
                </div>

                {children}
            </div>
        );
    }
}

const ValueType = PropTypes.shape({
    value: PropTypes.any,
    isLinked: PropTypes.bool
});

const propItemTypeShape = {
    label: PropTypes.string,
    type: PropTypes.string,
    view: PropTypes.oneOf([
        'input',
        'textarea',
        'toggle',
        'list',
        'constructor',
        'object',
        'shape',
        'array',
        'empty'
    ]),
    image: PropTypes.string,
    tooltip: PropTypes.string,
    linkable: PropTypes.bool,
    transformValue: PropTypes.func,

    // Options for 'list' view
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        text: PropTypes.string,
        disabled: PropTypes.bool
    }))
};

// Fields for 'shape' view
propItemTypeShape.fields = PropTypes.objectOf(PropTypes.shape(propItemTypeShape));

// Type for 'array' and 'object' views
propItemTypeShape.ofType = PropTypes.shape(propItemTypeShape);

const PropItemType = PropTypes.shape(propItemTypeShape);

PropsItem.propTypes = {
    propType: PropItemType.isRequired,
    value: ValueType.isRequired,
    disabled: PropTypes.bool,
    setComponentButtonText: PropTypes.string,
    editComponentButtonText: PropTypes.string,
    addButtonText: PropTypes.string,

    onChange: PropTypes.func,
    onChangeNested: PropTypes.func,
    onAddValue: PropTypes.func,
    onDeleteValue: PropTypes.func,
    onLink: PropTypes.func,
    onLinkNested: PropTypes.func,

    _secondary: PropTypes.bool,
    _deletable: PropTypes.bool,
    _dimLabel: PropTypes.bool,
    _onOpen: PropTypes.func,
    _onDelete: PropTypes.func
};

PropsItem.defaultProps = {
    disabled: false,
    setComponentButtonText: '',
    editComponentButtonText: '',
    addButtonText: '',

    onChange: noop,
    onChangeNested: noop,
    onAddValue: noop,
    onDeleteValue: noop,
    onLink: noop,
    onLinkNested: noop,

    _secondary: false,
    _deletable: false,
    _dimLabel: false,
    _onOpen: noop,
    _onDelete: noop
};

PropsItem.displayName = 'PropsItem';
