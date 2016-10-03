import React, { PropTypes } from 'react';

import {
	Button,
	Input,
	SelectBox,
	Textarea,
	ToggleButton
} from '@reactackle/reactackle';

export const PropItemArray = props => {
    let className = 'prop-item';

    return (
        <div className={className}>
	        <table className="prop-array-table">
		        <thead>
			        <tr>
				        <td className="prop-array-header">title 1</td>
				        <td className="prop-array-header">title 2</td>
			        </tr>
		        </thead>
		        <tbody>
			        <tr>
				        <td className="prop-array-body">body 1</td>
				        <td className="prop-array-body">body 2</td>
			        </tr>
		        </tbody>
	        </table>
        </div>
    );
};

PropItemArray.propTypes = {
};

PropItemArray.defaultProps = {
};

PropItemArray.displayName = 'PropItemArray';
