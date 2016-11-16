import React, { PropTypes } from 'react';
import { ConstructionPane } from '../ConstructionPane/ConstructionPane';

import './IsolationView.scss';

const ViewRuler = props => (
	<div className={`isolation_view-ruler ruler-position-` + props.position}></div>
);

ViewRuler.propTypes = {
	position: PropTypes.oneOf(['x', 'y', 'entire'])
};

ViewRuler.defaultProps = {
	position: 'x'
};

export const IsolationView = props => {
	let className="isolation-view";

	const viewStyle = {
		width: props.width,
		minWidth: props.minWidth,
		maxWidth: props.maxWidth,
		height: props.height,
		minHeight: props.minHeight,
		maxHeight: props.maxHeight
	};

	const widthStyle = {
		width: props.width,
		minWidth: props.minWidth,
		maxWidth: props.maxWidth
	};

	return (
		<div className={className} style={{height: '600px'}}>
			<ConstructionPane />
		</div>
	);
};

IsolationView.propTypes = {
	adaptive: PropTypes.bool,
	width: PropTypes.string,
	minWidth: PropTypes.string,
	maxWidth: PropTypes.string,
	height: PropTypes.string,
	minHeight: PropTypes.string,
	maxHeight: PropTypes.string
};

IsolationView.defaultProps = {
	adaptive: false,
	width: '',
	minWidth: '',
	maxWidth: '',
	height: '',
	minHeight: '',
	maxHeight: ''
};

IsolationView.displayName = 'IsolationView';


