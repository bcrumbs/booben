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
        subtitle = null,
        description = null,
        content = null,
        backButton = null;
    
    if (props.backButton) {
        backButton =
            <div className="data-window_back">
                <Button icon="chevron-left"/>
            </div>
    }
    
    if (props.subtitle) {
        subtitle =
            <div className="data-window_subtitle">
                {props.subtitle}
            </div>
    }
    
    if (props.list) {
        content =
            <BlockContentBoxItem>
                <DataList data={props.list} />
                {props.children}
            </BlockContentBoxItem>;
    }
    
    if (props.title) {
        title =
            <BlockContentBoxItem>
                <div className="data-window_title-box">
                    {backButton}
                    
                    <div className="data-window_title-content">
                        <div className="data-window_title">
                            {props.title}
                        </div>
                        {subtitle}
                    </div>
                </div>
            </BlockContentBoxItem>;
    }
    
    if (props.description) {
        description =
            <div className="data-window_description-box">
                <BlockContentBoxHeading>Description</BlockContentBoxHeading>
                <BlockContentBoxItem>{props.description}</BlockContentBoxItem>
            </div>
    }
    
    return (
        <div className="data-window_content">
            {title}
            {description}
            {content}
        </div>
    );
};

DataWindowContent.propTypes = {
	title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    list: PropTypes.arrayOf,
    
    /*
        We use backButton for attributes editing screen only
     */
    backButton: PropTypes.bool
};

DataWindowContent.defaultProps = {
	title: '',
    subtitle: '',
    description: '',
    list: [],
    backButton: false
};

DataWindowContent.displayName = 'DataWindowContent';
