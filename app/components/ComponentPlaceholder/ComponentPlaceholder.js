import './ComponentPlaceholder.scss';
import React, { PropTypes, Component } from 'react';

export const ComponentPlaceholder = props => {
    let className = 'component-placeholder';

    className += props.isPlaced? ' is-placed' : ' is-free';

    return (
        <div className={className}>
            <div className='component-placeholder-title'>
                { props.title }
            </div>
        </div>
    );
};

ComponentPlaceholder.propTypes = {
	title: PropTypes.string,
	isPlaced: PropTypes.bool
};

ComponentPlaceholder.defaultProps = {
	title: '',
	isPlaced: false
};

ComponentPlaceholder.displayName = 'ComponentPlaceholder';
