import React, { PropTypes } from 'react';

export const DataItem = props => {
    let className = 'data-list-item';

	if (props.clickable) className += ' is-clickable';

    let tooltip = null;
	if (props.tooltip) {
		tooltip = (
			<TooltipIcon text={props.tooltip} />
		);
	}

	return (
		<div className={className}>
			<div className='data-item_title-box'>
				<div className="data-item_title">
					<span className="data-item_title-text">{props.title}</span>
					<span className="data-item_type">{props.type}</span>
					{tooltip}
				</div>
				<div className="data-item_subtitle">{props.subtitle}</div>
			</div>
		</div>
	);
};

DataItem.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	type: PropTypes.string,
	tooltip: PropTypes.string,
	clickable: PropTypes.bool
};

DataItem.defaultProps = {
	title: '',
	subtitle: '',
	type: '',
	tooltip: '',
	clickable: false
};

DataItem.displayName = 'DataItem';
