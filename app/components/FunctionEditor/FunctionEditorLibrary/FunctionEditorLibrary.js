'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import './FunctionEditorLibrary.scss';

import {
    BlockContentBoxItem,
    BlockContentBoxHeading
} from '../../BlockContent/BlockContent';

const LibraryItem = props => (
    <div className="editor_library-item">
        <div className="editor_library-item_title">
            { props.title }
        </div>
        <div className="editor_library-item_subtitle">
            { props.subtitle }
        </div>
    </div>
);

export const FunctionEditorLibrary = props => {
    let className = 'editor_library';
    
    let list = props.data.map((item, idx) => (
        <LibraryItem
            key={idx}
            title={item.title}
            subtitle={item.subtitle}
        />
    ));

    return (
        <div className={className} >
            <BlockContentBoxHeading>Library</BlockContentBoxHeading>
            <BlockContentBoxItem>
                { list }
            </BlockContentBoxItem>
        </div>
    );
};

FunctionEditorLibrary.propTypes = {
    data: PropTypes.arrayOf(LibraryItem)
};

FunctionEditorLibrary.defaultProps = {
    data: []
};

