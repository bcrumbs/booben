'use strict';

import React, { Component, PropTypes } from 'react';

export const LayoutSelectionItem = props => {
	let className = 'layout-item';

	let subtitle = null;
	if (props.subtitle) {
		subtitle = <div className="layout-item-subtitle">{ props.subtitle }</div>;
	}

	return (
		<div className={className}>
			<div className="layout-item-image-box">
				<img src={ props.image } />
			</div>
			<div className="layout-item-title-box">
				<div className="layout-item-title">{ props.title }</div>
				{ subtitle }
			</div>
		</div>
	);
};

LayoutSelectionItem.propTypes = {
	image: PropTypes.string,
	title: PropTypes.string,
	subtitle: PropTypes.string
};

LayoutSelectionItem.defaultProps = {
	image: '',
	title: '',
	subtitle: ''
};

LayoutSelectionItem.displayName = 'LayoutSelectionItem';
