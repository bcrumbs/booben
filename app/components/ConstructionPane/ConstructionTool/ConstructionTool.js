import React, { PropTypes } from 'react';

import {
	Column,
	Input,
	Row
} from '@reactackle/reactackle';

import './ConstructionTool.scss';

export const ConstructionTool = props => {
	let className="construction-tool";

	return (
		<div className={className}>
			<Row
				layoutDirection="horizontal"
			    behavior="nest"
			>
				<Column
					layoutDirection="vertical"
					size={{'xsmall': '6'}}
				>
					<Input label="Width" value="300px"/>
					<div className="construction-tool_data-row">
						<div className="construction-tool_data-item-additional">min-width: 0</div>
						<div className="construction-tool_data-item-additional">max-width: 100%</div>
					</div>
				</Column>

				<Column
					layoutDirection="vertical"
					size={{'xsmall': '6'}}
				>
					<Input label="Height" value="300px" />
					<div className="construction-tool_data-row">
						<div className="construction-tool_data-item-additional">min-width: 0</div>
						<div className="construction-tool_data-item-additional">max-width: 100%</div>
					</div>
				</Column>
			</Row>
		</div>
	);
};

ConstructionTool.propTypes = {

};

ConstructionTool.defaultProps = {

};

ConstructionTool.displayName = 'ConstructionTool';


