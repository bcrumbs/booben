import React, { PropTypes } from 'react';

import { PropArrayAddNewRow } from './PropArrayAddNewRow/PropArrayAddNewRow';

export const PropItemArray = props => {
    let className = 'prop-item-array-wrapper';

    return (
        <div className={className}>
	        <table className="prop-array-table">
		        {props.children}
	        </table>
	        <PropArrayAddNewRow text={props.newRowButtonText}/>
        </div>
    );
};

PropItemArray.propTypes = {
	newRowButtonText: PropTypes.string
};

PropItemArray.defaultProps = {
	newRowButtonText: 'Add Row'
};

PropItemArray.displayName = 'PropItemArray';

export * from './PropItemArrayHeader/PropItemArrayHeader';
export * from './PropItemArrayHeader/PropItemArrayHeaderRow/PropItemArrayHeaderRow';
export * from './PropItemArrayHeader/PropItemArrayHeaderCell/PropItemArrayHeaderCell';

export * from './PropItemArrayBody/PropItemArrayBody';
export * from './PropItemArrayBody/PropArrayBodyRow/PropArrayBodyRow';
export * from './PropItemArrayBody/PropArrayBodyCell/PropArrayBodyCell';

