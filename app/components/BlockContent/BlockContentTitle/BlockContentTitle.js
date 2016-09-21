'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {
    Icon,
    Button
} from '@reactackle/reactackle';

import { List } from 'immutable';

import ButtonType from '../../../models/Button';

import { noop } from '../../../utils/misc';

export const BlockContentTitle = props => {
    const prefix = 'block-content';

    let titleClassName = `${prefix}-title-box`;
    if (props.isEditable) titleClassName += ' is-editable';
    if (props.editingOn) titleClassName += ' editing-is-on';

    let iconLeft = null;
    if (props.iconLeft) {
        iconLeft = (
            <div
                className={`${prefix}-icon ${prefix}-icon-left`}
                onMouseDown={props.onLeftIconMouseDown}
            >
                <Icon name={props.iconLeft} />
            </div>
        );
    }


    let buttonsArea = null;
    if (props.buttons.size > 0) {
        const buttons = props.buttons.map((button, idx) => (
            <Button
                key={idx}
                icon={button.icon}
                disabled={button.disabled}
                onPress={button.onPress}
            />
        ));

        buttonsArea = (
            <div className={`${prefix}-title-actions-wrapper`}>
                {buttons}
            </div>
        );
    }

    const title = (
        <div className={titleClassName}>
            <span
                className={`${prefix}-title`}
                contentEditable={props.isEditable}
            >
                {props.title}
            </span>
        </div>
    );

    let subtitle = null;
    if (props.subtitle) {
        subtitle = (
            <div className={`${prefix}-subtitle-box`}>
                <span className={`${prefix}-subtitle`}>
                    {props.subtitle}
                </span>
            </div>
        );
    }

    return (
        <div className={`${prefix}-title-area`}>
            {iconLeft}

            <div className={`${prefix}-title-content`}>
                {title}
                {subtitle}
            </div>

            {buttonsArea}
        </div>
    );
};

BlockContentTitle.propTypes = {
    title: PropTypes.string.isRequired,
    isEditable: PropTypes.bool,
    editingOn: PropTypes.bool,
    subtitle: PropTypes.string,
    iconLeft: PropTypes.string,
    buttons: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(ButtonType)
    ),
    onLeftIconMouseDown: PropTypes.func
};

BlockContentTitle.defaultProps = {
    title: '',
    isEditable: false,
    editingOn: false,
    subtitle: null,
    iconLeft: null,
    buttons: List(),
    onLeftIconMouseDown: noop
};

BlockContentTitle.displayName = 'BlockContentTitle';
