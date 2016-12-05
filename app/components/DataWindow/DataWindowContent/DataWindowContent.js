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
    
    let contentHeading = null;
    if (props.contentHeading) contentHeading = <BlockContentBoxHeading>{props.contentHeading}</BlockContentBoxHeading>;
    
    let list = null;
    if (props.list) list =
        <BlockContentBoxItem>
            { list }
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
        description = <BlockContentBoxItem>{props.description}</BlockContentBoxItem>;
    }
    
    let heading = null;
    if ( title ) heading =
        <div className="data-window_content-heading">
            { title }
            { description }
            { argsButton }
        </div>;
    
    return (
        <div className="data-window_content">
            { heading }
            { contentHeading }
            { props.children }
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
    list: PropTypes.arrayOf
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