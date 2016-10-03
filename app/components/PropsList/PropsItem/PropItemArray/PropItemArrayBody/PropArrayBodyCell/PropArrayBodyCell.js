import React, { PropTypes } from 'react';

import {
	Button
} from '@reactackle/reactackle';

export const PropArrayBodyCell = props => {
    let className = 'prop-array-body-cell';

	let content = false;
	if (props.clearing) {
		content =
			<div className="prop-array-clearing-cell">
				<Button icon="times" size="small" />
			</div>
	} else {
		content = props.children;
	}

	if (props.align) className += ' ' + 'prop-array-cell-align-' + props.align;

    return (
        <td className={className}>
            { content }
        </td>
    );
};

PropArrayBodyCell.propTypes = {
	clearing: PropTypes.bool,
	align: PropTypes.oneOf(['left', 'center', 'right'])
};

PropArrayBodyCell.defaultProps = {
	clearing: false,
	align: 'left'
};

PropArrayBodyCell.displayName = 'PropArrayBodyCell';

export * from './PropArrayBodyCellText/PropArrayBodyCellText';
