'use strict';

import React, { Component, PropTypes } from 'react';

export const ComponentLayoutSelectionItem = props => {
	let className = 'component-layout-item';

	let subtitle = null;
	if (props.subtitle) {
		subtitle = <div className="component-layout-item-subtitle">{ props.subtitle }</div>;
	}

	return (
		<div className={className}>
			<div className="component-layout-item-image-box">
				<img src={ props.image } />
			</div>
			<div className="component-layout-item-title-box">
				<div className="component-layout-item-title">{ props.title }</div>
				{ subtitle }
			</div>
		</div>
	);
};

ComponentLayoutSelectionItem.propTypes = {
	image: PropTypes.string,
	title: PropTypes.string,
	subtitle: PropTypes.string
};

ComponentLayoutSelectionItem.defaultProps = {
	image: '',
	title: '',
	subtitle: ''
};

ComponentLayoutSelectionItem.displayName = 'ComponentLayoutSelectionItem';
