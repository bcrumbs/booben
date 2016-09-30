'use strict';

import React, { PropTypes } from 'react';
import {
	Button,
	Icon
} from '@reactackle/reactackle';

export const RouteCard = props => {
    let className = 'route-card';

	if (props.root) className += ' ' + 'is-root';
	if (props.home) className += ' ' + 'is-home';
	if (props.focused) className += ' ' + 'is-focused';

	let iconIndex = false;
	if (props.home) {
		iconIndex =
			<div className="route-icon-index">
				<Icon name="home" />
			</div>
	}

	const actions =
		<div className="route-actions-box">
			<div className="route-action-item">
				<Icon name="cog" />
			</div>
		</div>;

	const addRoute =
		<button className="route-add-new" tabIndex="1">
			<div className="route-add-new-inside">
				<Icon name="plus" />
			</div>
		</button>;

    return (
        <li
            className='route-card-wrapper'
        >
	        <div
		        className={className}
	             tabIndex="1"
	        >
		        <div className="route-card-content">
			        <div className="route-title-box">
				        <span className="route-title">{props.title}</span>
				        { iconIndex }
			        </div>
			        <div className="route-subtitle">{props.subtitle}</div>
		        </div>
	        </div>

	        {props.children}
        </li>
    );
};

RouteCard.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	root: PropTypes.bool,
	home: PropTypes.bool,
	focused: PropTypes.bool
};

RouteCard.defaultProps = {
	title: '',
	subtitle: '',
	root: false,
	home: false,
	focused: false
};

RouteCard.displayName = 'RouteCard';


