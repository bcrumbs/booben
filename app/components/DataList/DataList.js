import React, { PropTypes } from 'react';
import './DataList.scss';

import { DataItem } from './DataItem/DataItem';

export const DataList = props => {
    let className = 'data-list';
    
    let list = props.data.map((item, idx) => (
        <DataItem
            key={idx}
            {...item}
        />
    ));

	return (
		<div className={className}>
			{ list }
			{ props.children }
		</div>
	);
};

DataList.propTypes = {
    data: PropTypes.arrayOf
};

DataList.defaultProps = {
    data: []
};

DataList.displayName = 'DataList';

export * from './DataItem/DataItem';
