import React, { PropTypes } from 'react';

import { PropArrayAddNewRow }   from './PropArrayAddNewRow/PropArrayAddNewRow';
import { PropArrayNewRow }      from './PropArrayNewRow/PropArrayNewRow';

export const PropItemArray = props => {
    let className = 'prop-item-array-wrapper';

    return (
        <div className={className}>
	        <table className="prop-array-table">
		        {props.children}
	        </table>
	        <PropArrayNewRow />
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

/* example
	<PropItemArray>
		<PropItemArrayHeader>
			<PropItemArrayHeaderRow>
				<PropItemArrayHeaderCell>Title</PropItemArrayHeaderCell>
				<PropItemArrayHeaderCell align="center">Sortable</PropItemArrayHeaderCell>
				<PropItemArrayHeaderCell />
			</PropItemArrayHeaderRow>
		</PropItemArrayHeader>
		<PropItemArrayBody>
			<PropArrayBodyRow>
				<PropArrayBodyCell>
					<PropConstructor label={'body 1-1'} />
				</PropArrayBodyCell>
				<PropArrayBodyCell align="center">
					<Checkbox />
				</PropArrayBodyCell>
				<PropArrayBodyCell clearing />
			</PropArrayBodyRow>
			<PropArrayBodyRow>
				<PropArrayBodyCell>
					<PropConstructor label={'body 2-1'} />
				</PropArrayBodyCell>
				<PropArrayBodyCell align="center">
					<Checkbox />
				</PropArrayBodyCell>
				<PropArrayBodyCell clearing />
			</PropArrayBodyRow>
		</PropItemArrayBody>
	</PropItemArray>
*/