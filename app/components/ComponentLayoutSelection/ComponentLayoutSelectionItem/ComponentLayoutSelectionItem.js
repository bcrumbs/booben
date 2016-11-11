'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { noop } from '../../../utils/misc';

export const ComponentLayoutSelectionItem = props => {
    let subtitle = null;
    if (props.subtitle) {
        subtitle = (
            <div className="component-layout-item-subtitle">
                {props.subtitle}
            </div>
        );
    }

    return (
        <div className="component-layout-item" onClick={props.onClick}>
            <div className="component-layout-item-image-box">
                <img src={props.image} />
            </div>

            <div className="component-layout-item-title-box">
                <div className="component-layout-item-title">
                    {props.title}
                </div>

                {subtitle}
            </div>
        </div>
    );
};

ComponentLayoutSelectionItem.propTypes = {
    image: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    onClick: PropTypes.func
};

ComponentLayoutSelectionItem.defaultProps = {
    image: '',
    title: '',
    subtitle: '',
    onClick: noop
};

ComponentLayoutSelectionItem.displayName = 'ComponentLayoutSelectionItem';
