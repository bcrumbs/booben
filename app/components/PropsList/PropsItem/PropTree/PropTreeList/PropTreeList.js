import React, { PropTypes } from 'react';

import {
	Button,
	Input,
	SelectBox
} from '@reactackle/reactackle';

export const PropTreeList = props => {

	let addButton = null;
	if (props.addButton) {
		addButton =
			<div className="prop-tree-item-action-row">
				<Button
					text="Add field"
					icon="plus"
					size="small"
				    narrow
				/>
			</div>
		;
	}

	let newField = null;
	if (props.newField) {
		newField =
			<div className='prop-tree_field-new'>
				<Input label={'Field title'} dense />
				<SelectBox label={'Type'} dense />
				<Button text="Save" />
			</div>;
	}


	return (
		<div className='prop-tree_list'>
			{ props.children }
			{ addButton }
			{ newField }
		</div>
	);
};

PropTreeList.propTypes = {
	addButton: PropTypes.bool,
	newField: PropTypes.bool
};

PropTreeList.defaultProps = {
	addButton: false,
	newField: false
};

PropTreeList.displayName = 'PropTreeList';
