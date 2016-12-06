import React from 'react';

export const ComponentsTreeLine = ({ createElementRef }) =>
	<div
		ref={createElementRef}
		className="components-tree_line-wrapper"
	>
        <div
            className="components-tree_line"
        />
	</div>;

ComponentsTreeLine.PropTypes = {

};
ComponentsTreeLine.defaultProps = {

};
