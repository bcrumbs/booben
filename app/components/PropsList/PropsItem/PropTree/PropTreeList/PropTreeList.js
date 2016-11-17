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
				<div className='prop-tree_field-new_row field-new_title'>
					New field
				</div>

				<div className='prop-tree_field-new_row'>
					<Input label={'Field title'} dense />
				</div>
				<div className='prop-tree_field-new_row'>
					<SelectBox label={'Type'} dense />
				</div>
				<div className='prop-tree_field-new_row field-new_buttons'>
					<Button text="Save" narrow/>
				</div>
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
