'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
    Button
} from '@reactackle/reactackle';

import { PropsItem } from '../PropsList/PropsItem/PropsItem';
import {
    BlockContentBoxItem,
    BlockContentBoxHeading
} from '../BlockContent/BlockContent';
import { FunctionArgumentNew } from './FunctionArgumentNew/FunctionArgumentNew';

import './FunctionArgumentsList.scss';

const FunctionArgumentItem = props => (
    <PropsItem
        propType = {{
            label: props.label,
            type: props.type,
            view: "empty"
        }}
        value={{
            value: ''
        }}
        
        _deletable
    />
);

const SAMPLE_ARGUMENTS = [
    {
        label: 'title',
        type: 'string'
    },
    {
        label: 'arg2',
        type: 'string'
    }
];

export const FunctionArgumentsList = props => {
    let className = 'function-arguments_list';

    let list = SAMPLE_ARGUMENTS.map((item, idx) => (
        <FunctionArgumentItem
            label={item.label}
            type={item.type}
        />
    ));
    
    const argumentsAdd = props.newArgument
        ? <FunctionArgumentNew />
        :
            <div className="function-arguments_list-button">
                <BlockContentBoxItem>
                    <Button icon="plus" text="New argument" narrow />
                </BlockContentBoxItem>;
            </div>;
        
    
    return (
        <div className={className} >
            <BlockContentBoxHeading>Arguments List</BlockContentBoxHeading>
            <BlockContentBoxItem>
                <div className='function-arguments_list-items' >
                    { list }
                </div>
            </BlockContentBoxItem>
            <div className='function-arguments_new' >
                { argumentsAdd }
            </div>
        </div>
    );
};

FunctionArgumentsList.propTypes = {
    newArgument: PropTypes.bool
};

FunctionArgumentsList.defaultProps = {
    newArgument: false
};

FunctionArgumentsList.displayName = 'FunctionArgumentsList';
