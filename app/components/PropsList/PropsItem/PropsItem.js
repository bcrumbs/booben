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

import { noop } from '../../../utils/misc';

export class PropsItem extends PureComponent {
    constructor(props) {
        super(props);
        
        this._handleToggleOpen = this._handleToggleOpen.bind(this);
    }
    
    _handleToggleOpen() {
        
    }
    
    render() {
        let className = 'prop-item',
            wrapperClassName = 'prop-item-wrapper';

        if (this.props.propType.view)
            className += ` prop-type-${this.props.propType.view}`;
        
        if (this.props.subtreeOn) wrapperClassName += ' sublevel-is-visible';
        if (this.props.dimLabel) className += ' is-flat-array';

        if (this.props._isOpen) {
            wrapperClassName += ' sublevel-is-visible';
            className += ' sublevel-is-visible';
        }

        let content = null;
        if (this.props.propType.view === 'input') {
            content = (
                <Input
                    value={this.props.value}
                    disabled={this.props.disabled}
                    onChange={this.props.onChange}
                />
            );
        }
        else if (this.props.propType.view === 'textarea') {
            content = (
                <Textarea
                    value={this.props.value}
                    disabled={this.props.disabled}
                    onChange={this.props.onChange}
                />
            );
        }
        else if (this.props.propType.view === 'list') {
            content = (
                <SelectBox
                    data={this.props.propType.options}
                    value={this.props.value}
                    disabled={this.props.disabled}
                    onSelect={this.props.onChange}
                />
            );
        }
        else if (this.props.propType.view === 'constructor') {
            content = (
                <Button
                    kind="link"
                    text={this.props.setComponentButtonText}
                    onPress={this.props.onChange}
                />
            );
        }

        let toggle = null;
        if (this.props.propType.view === 'toggle') {
            toggle = (
                <div className="prop_action prop_action-toggle">
                    <ToggleButton
                        checked={this.props.value}
                        disabled={this.props.disabled}
                        onCheck={this.props.onChange}
                    />
                </div>
            );
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
                        <Button icon="times" onPress={this.props.onDelete} />
                    </div>
                </div>
            );
        }

        const isComplexValue =
            this.props.propType.view === 'shape' ||
            this.props.propType.view === 'object' ||
            this.props.propType.view === 'array';

        let collapseAction = null;
        if (isComplexValue) {
            collapseAction = (
                <div className="prop_action prop_action-collapse">
                    <Button icon="chevron-right" onPress={this._handleToggleOpen}/>
                </div>
            );

            className += ' has-sublevel';
        }

        let linkAction = null;
        if (this.props.propType.linkable) {
            linkAction = (
                <div className="prop_action prop_action-linking">
                    <Button icon="link" onPress={this.props.onLink}/>
                </div>
            );
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

                {this.props.children}
            </div>
        );
    }
}

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
        'array'
    ]),
    image: PropTypes.string,
    tooltip: PropTypes.string,
    linkable: PropTypes.bool,

    // Options for 'list' view
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any,
        text: PropTypes.string,
        disabled: PropTypes.bool
    }))
};

// Fields for 'shape' view
propItemTypeShape.fields = PropTypes.objectOf(PropTypes.shape(propItemTypeShape));

// Type for 'array' and 'object' views (required for 'array', optional for 'object')
propItemTypeShape.ofType = PropTypes.shape(propItemTypeShape);

const PropItemType = PropTypes.shape(propItemTypeShape);

PropsItem.propTypes = {
    propType: PropItemType.isRequired,
    value: PropTypes.any,
    disabled: PropTypes.bool,
    subtreeOn: PropTypes.bool,
    dimLabel: PropTypes.bool,
    setComponentButtonText: PropTypes.string,

    onChange: PropTypes.func,
    onLink: PropTypes.func,
    onDelete: PropTypes.func,
    
    _secondary: PropTypes.bool,
    _deletable: PropTypes.bool,
    _isOpen: PropTypes.bool,
    _onToggleOpen: PropTypes.func
};

PropsItem.defaultProps = {
    value: null,
    disabled: false,
    subtreeOn: false,
    dimLabel: false,
    setComponentButtonText: '',

    onChange: noop,
    onLink: noop,
    onDelete: noop,

    _secondary: false,
    _deletable: false,
    _isOpen: false,
    _onToggleOpen: noop
};

PropsItem.displayName = 'PropsItem';
