import React, { PropTypes } from 'react';

import {
	Button,
	Input
} from '@reactackle/reactackle';

import {PropArrayBodyRow} from '../PropItemArrayBody/PropArrayBodyRow/PropArrayBodyRow';
import {PropArrayBodyCell} from '../PropItemArrayBody/PropArrayBodyCell/PropArrayBodyCell';

export const PropArrayNewRow = props => {
    let className = 'prop-array-body-new-row';

    return (
    	<div className={className}>
		    <Input label={'Row title'} dense />
		    <Button text="Save" />
        </div>
    );
};

PropArrayNewRow.propTypes = {
};

PropArrayNewRow.defaultProps = {
};

PropArrayNewRow.displayName = 'PropArrayNewRow';
