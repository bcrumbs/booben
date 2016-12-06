import React, { PropTypes } from 'react';
import {
} from '@reactackle/reactackle';
import './BlockActionBar.scss';

const
	propTypes = {
        items: PropTypes.arrayOf()
	},
	defaultProps = {
	    items: []
	};

const BlockActionBarItem = props => (
    <button className={`action-bar_item ` + ( props.active ? 'is-active' : '')}>{props.text}</button>
);
	
export const BlockActionBar = props => {
    let className = 'block-action-bar';
    
    const list = props.items.map((item, idx) => (
        <BlockActionBarItem
            key={ idx }
            active={ item.active }
            text={ item.text }
        />
    ));

    return (
        <div className={className}>
            <div className='block-action-bar_list'>
                { list }
            </div>
        </div>
    );
};

BlockActionBar.propTypes = propTypes;
BlockActionBar.defaultProps = defaultProps;
BlockActionBar.displayName = 'BlockActionBar';
