import React, { Component, PropTypes } from 'react';
import { Icon, Button } from '@reactackle/reactackle';

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
    if (props.buttons && props.buttons.length) {
        const buttons = props.buttons.map((button, idx) => (
            <Button
                key={idx}
                icon={button.icon}
                disabled={!!button.disabled}
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
    isEditable: PropTypes.bool,
    editingOn: PropTypes.bool,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    iconLeft: PropTypes.string,
    buttons: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
        onPress: PropTypes.func.isRequired
    })),
    onLeftIconMouseDown: PropTypes.func
};

BlockContentTitle.defaultProps = {
    isEditable: false,
    editingOn: false,
    title: '',
    subtitle: null,
    iconLeft: null,
    buttons: [],
    onLeftIconMouseDown: /* istanbul ignore next */ () => {}
};

BlockContentTitle.displayName = 'BlockContentTitle';
