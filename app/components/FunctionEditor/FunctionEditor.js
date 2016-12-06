'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import './FunctionEditor.scss';

import {
    BlockContentBoxItem
} from '../BlockContent/BlockContent';

export const FunctionEditor = props => {
    let className = 'function-editor';

    return (
        <div className={className} >
            <div className='function-editor_heading'>
                <BlockContentBoxItem>
                    <pre>
                        function myFunction (
                            arg1 (string), arg2 (bool)
                        )
                    </pre>
                </BlockContentBoxItem>
            </div>
            <div className='function-editor_wrapper'>
                Here'll be editor
            </div>
        </div>
    );
};

FunctionEditor.propTypes = {
};

FunctionEditor.defaultProps = {
};

FunctionEditor.displayName = 'FunctionEditor';

export * from './FunctionEditorLibrary/FunctionEditorLibrary';