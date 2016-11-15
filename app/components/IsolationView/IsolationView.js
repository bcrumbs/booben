import React, { PropTypes } from 'react';
import {
	Row,
	Column
} from '@reactackle/reactackle';

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

	let rulerX = false,
		rulerY = false,
		rulerEntire = false;

	if (props.maxHeight==='none' || !props.maxHeight) {
		rulerY = <ViewRuler position={'y'}/>
	}
	if (props.maxWidth==='none' || !props.maxWidth) {
		rulerX = <ViewRuler position={'x'}/>
	}
	if ((props.maxHeight==='none' || !props.maxHeight) && (props.maxWidth==='none' || !props.maxWidth)) {
		rulerEntire = <ViewRuler position={'entire'}/>
	}

	return (
		<div className={className}>
			<div className="isolation_data-box">
			<div className="isolation_data-title">ParentComponentTitle</div>
			<div className="isolation_data-row">
				<Row
					layoutDirection={'horizontal'}
					behavior="nest"
				>
					<Column
						layoutDirection={'vertical'}
						layoutY="start"
					>
						<div>width: {props.width}</div>
						<div>min-width: {props.minWidth}</div>
						<div>max-width: {props.maxWidth}</div>
					</Column>
					<Column
						layoutDirection={'vertical'}
						layoutY="start"
					>
						<div>height: {props.height}</div>
						<div>min-height: {props.minHeight}</div>
						<div>max-height: {props.maxHeight}</div>
					</Column>
				</Row>
			</div>
		</div>
			<div className="isolation_view-box">
				<div className="isolation_view-row" style={viewStyle}>
					<div className="isolation_view">
						<div className="isolation_view-content">
							{props.children}
						</div>
					</div>
					{rulerX}
				</div>
				<div className="isolation_view-row" style={widthStyle}>
					{rulerY}
					{rulerEntire}
				</div>
			</div>
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


