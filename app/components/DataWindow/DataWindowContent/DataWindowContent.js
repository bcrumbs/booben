'use strict';

import React, { PureComponent, PropTypes } from 'react';

import {
    Button
} from "@reactackle/reactackle";

import {
    BlockContentBoxItem,
    BlockContentBoxHeading
} from '../../BlockContent/BlockContent';

import {
    DataList,
    DataItem
} from '../../DataList/DataList';

export const DataWindowContent= props => {
    let title = null,
        type = null,
        subtitle = null,
        argsButton = null,
        descriptionHeading = null,
        description = null,
        content = null;

    if (props.type) {
        type =
            <div className="data-window_type">
                {props.type}
            </div>
    }

    if (props.subtitle) {
        subtitle =
            <div className="data-window_subtitle">
                {props.subtitle}
            </div>
    }

    if (props.argsButton) {
        argsButton =
            <BlockContentBoxItem>
                <div className="data-window_heading-buttons">
                    <Button text="Set Arguments" narrow/>
                </div>
            </BlockContentBoxItem>
    }

    let contentHeading = <BlockContentBoxHeading>{props.contentHeading}</BlockContentBoxHeading>;
    content =
        <BlockContentBoxItem>
            <DataList data={props.list} />
            {props.children}
        </BlockContentBoxItem>;

    if (props.title) {
        title =
            <BlockContentBoxItem>
                <div className="data-window_title-box">
                    <div className="data-window_title-content">
                        <div className="data-window_title">
                            {props.title}
                        </div>
                        {type}
                        {subtitle}
                    </div>
                </div>
            </BlockContentBoxItem>;
    }

    if (props.description) {
        descriptionHeading = <BlockContentBoxHeading>Description</BlockContentBoxHeading>;
        description = <BlockContentBoxItem>{props.description}</BlockContentBoxItem>;
    }

    return (
        <div className="data-window_content">
            <div className="data-window_content-heading">
                { title }
                { descriptionHeading }
                { description }
                { argsButton }
            </div>
            { contentHeading }
            { content }
        </div>
    );
};

DataWindowContent.propTypes = {
	title: PropTypes.string,
    type: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    contentHeading: PropTypes.string,
    argsButton: PropTypes.bool,
    list: PropTypes.arrayOf(PropTypes.object)
};

DataWindowContent.defaultProps = {
	title: '',
    type: '',
    subtitle: '',
    description: '',
    contentHeading: '',
    argsButton: false,
    list: []
};

DataWindowContent.displayName = 'DataWindowContent';

export * from "./DataWindowContentGroup/DataWindowContentGroup";
