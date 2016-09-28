'use strict';

import './ComponentTag.scss';
import React, { PropTypes } from 'react';

export const ComponentTag = props => {
    let className = 'component-tag-box';

	if (props.focused) className += ' ' + 'is-focused';

    return (
        <div
            className={className}
        >
	        <div className="component-tag">
                <picture className="component-tag-image">
	                <img src={props.image} />
                </picture>

		        <div className="component-tag-title-box">
			        <div className="component-tag-title">{props.title}</div>
		        </div>
            </div>
        </div>
    );
};

ComponentTag.propTypes = {
	image: PropTypes.string,
	title: PropTypes.string,
	focused: PropTypes.bool
};

ComponentTag.defaultProps = {
	image: '',
	title: '',
	focused: false
};

ComponentTag.displayName = 'ComponentTag';

export * from './ComponentTagWrapper/ComponentTagWrapper'

