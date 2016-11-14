import React, { PropTypes } from 'react';
import './DataList.scss';

export const DataList = props => {
    let className = 'data-list';

	return (
		<div className={className}>
			{ props.children }
		</div>
	);
};

DataList.propTypes = {
};

DataList.defaultProps = {
};

DataList.displayName = 'DataList';

export * from './DataItem/DataItem';
