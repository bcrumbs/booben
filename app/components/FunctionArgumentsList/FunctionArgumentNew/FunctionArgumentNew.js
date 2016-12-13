'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
    Input,
    Button
} from '@reactackle/reactackle';

import {
    BlockContentBoxItem,
    BlockContentBoxHeading
} from '../../BlockContent/BlockContent';

export const FunctionArgumentNew = props => {
    let className = 'function-arguments_new-wrapper';

    return (
        <div className={className} >
            <BlockContentBoxItem>
                <BlockContentBoxHeading>New Argument</BlockContentBoxHeading>
                <div className='inputs-row' >
                    <Input label="Title" />
                    <Input label="Type" />
                </div>
                <div className='button-row' >
                    <Button text="Add argument" narrow />
                </div>
            </BlockContentBoxItem>
        </div>
    );
};

FunctionArgumentNew.propTypes = {
};

FunctionArgumentNew.defaultProps = {
};

FunctionArgumentNew.displayName = 'FunctionArgumentNew';
