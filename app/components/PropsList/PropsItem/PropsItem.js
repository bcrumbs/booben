'use strict';

import React, { PropTypes } from 'react';

import {
    Button,
    Checkbox,
    Input,
    SelectBox,
    Textarea,
    ToggleButton
} from '@reactackle/reactackle';

import {
    PropItemArray,
    PropItemArrayHeader,
    PropItemArrayHeaderRow,
    PropItemArrayHeaderCell,
    PropItemArrayBody,
    PropArrayBodyRow,
    PropArrayBodyCell,
    PropArrayBodyCellText
} from './PropItemArray/PropItemArray';

import {
    PropTree,
    PropTreeList,
    PropTreeItem
} from './PropTree/PropTree';

import {PropLabel} from './PropLabel/PropLabel';
import {PropLinkButton} from './PropLinkButton/PropLinkButton';

import {PropConstructor} from './PropConstructor/PropConstructor';
import {PropArrayNewRow} from './PropItemArray/PropArrayNewRow/PropArrayNewRow';

import { noop } from '../../../utils/misc';

export const PropsItem = props => {
    let className = 'prop-item',
        wrapperClassName= 'prop-item-wrapper';

    if (props.type) className += ` prop-type-${props.type}`;
    if (props.subtreeOn) wrapperClassName+= ' ' + 'sublevel-is-visible';

    let actions = null;
    if (props.linkable) {
        actions = <PropLinkButton />;
    }

    let image = null;
    if (props.image) {
        image = (
            <div className="prop-item-image-box">
                <img src={props.image} />
            </div>
        );
        
        wrapperClassName += ' has-image';
    }

    const label =
        <PropLabel>{props.label}</PropLabel>;

    let content = false;
    if (props.type === 'input') {
        content = (
            <Input
                dense
                label={props.label}
                value={props.value}
                disabled={props.disabled}
                onChange={props.onChange}
                tooltip={props.tooltip}
            />
        );
    }
    else if (props.type === 'textarea') {
        content = (
            <Textarea
                dense
                label={props.label}
                value={props.value}
                disabled={props.disabled}
                onChange={props.onChange}
                tooltip={props.tooltip}
            />
        );
    }
    else if (props.type === 'toggle') {
        content = (
            <ToggleButton
                label={props.label}
                checked={props.value}
                disabled={props.disabled}
                onCheck={props.onChange}
                tooltip={props.tooltip}
            />
        );
    }
    else if (props.type === 'list') {
        content =
            <SelectBox
                label={props.label}
                dense
                data={props.options}
                value={props.value}
                disabled={props.disabled}
                onSelect={props.onChange}
                tooltip={props.tooltip}
            />
    }
    else if (props.type === 'constructor') {
        content =
            <PropConstructor label={props.label} tooltip={props.tooltip}/>
    }

    else if (props.type === 'constructor-toggle') {
        content =
            <PropConstructor label={props.label} hasToggle tooltip={props.tooltip} />
    }

    else if (props.type === 'tree') {
        content =
            <PropTree>
                <PropTreeList>
                    <PropTreeItem title="prop-1" opened>
                        <PropTreeList>
                            <PropTreeItem title="buttons" opened>
                                <PropTreeList addButton>
                                    <PropTreeItem title="button1" type="constructor" valueType="constructor" />
                                    <PropTreeItem title="button2" type="constructor" valueType="constructor" />
                                </PropTreeList>
                            </PropTreeItem>
                            <PropTreeItem title="onClick" type="function" valueType="input" />
                            <PropTreeItem title="value" type="number" valueType="input" />
                            <PropTreeItem title="some array">
                                <PropTreeList>
                                    <PropTreeItem title='1' type="arrayItem" valueType="input" />
                                    <PropTreeItem title='2' type="arrayItem" valueType="input" />
                                </PropTreeList>
                            </PropTreeItem>
                        </PropTreeList>
                    </PropTreeItem>
                </PropTreeList>
            </PropTree>
    }

    else if (props.type === 'array') {
        content =
            <PropItemArray>
                <PropItemArrayHeader>
                    <PropItemArrayHeaderRow>
                        <PropItemArrayHeaderCell>Title</PropItemArrayHeaderCell>
                        <PropItemArrayHeaderCell align="center">Sortable</PropItemArrayHeaderCell>
                        <PropItemArrayHeaderCell />
                    </PropItemArrayHeaderRow>
                </PropItemArrayHeader>
                <PropItemArrayBody>
                    <PropArrayBodyRow>
                        <PropArrayBodyCell>
                            <PropConstructor label={'body 1-1'} />
                        </PropArrayBodyCell>
                        <PropArrayBodyCell align="center">
                            <Checkbox />
                        </PropArrayBodyCell>
                        <PropArrayBodyCell clearing />
                    </PropArrayBodyRow>
                    <PropArrayBodyRow>
                        <PropArrayBodyCell>
                            <PropConstructor label={'body 2-1'} />
                        </PropArrayBodyCell>
                        <PropArrayBodyCell align="center">
                            <Checkbox />
                        </PropArrayBodyCell>
                        <PropArrayBodyCell clearing />
                    </PropArrayBodyRow>
                </PropItemArrayBody>
            </PropItemArray>
    }

    return (
        <div className={className}>
            <div className={wrapperClassName}>
                { image }

                <div className="prop-item-content-box">
                    { content }
                </div>

                { actions }
            </div>

            { props.children }
        </div>
    );
};

PropsItem.propTypes = {
    type: PropTypes.oneOf([
        'input',
        'textarea',
        'list',
        'constructor',
        'constructor-toggle',
        'array',
        'tree',
        'toggle'
    ]),
    label: PropTypes.string,
    linkable: PropTypes.bool,
    value: PropTypes.any,
    disabled: PropTypes.bool,
    image: PropTypes.string,
    subtreeOn: PropTypes.bool,
    options: PropTypes.array,
    onChange: PropTypes.func,
	tooltip: PropTypes.string
};

PropsItem.defaultProps = {
    type: 'input',
    label: '',
    linkable: false,
    value: null,
    disabled: false,
    image: '',
    subtreeOn: false,
    options: [],
    onChange: noop,
	tooltip: null
};

PropsItem.displayName = 'PropsItem';
