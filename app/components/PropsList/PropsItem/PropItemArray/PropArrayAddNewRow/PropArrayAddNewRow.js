import React, { PropTypes } from 'react';

import {
	Button
} from '@reactackle/reactackle';

export const PropArrayAddNewRow = props => {
    let className = 'prop-array-add-new-row';

    return (
        <div className={className}>
            <Button text={props.text} icon="plus"/>
        </div>
    );
};

PropArrayAddNewRow.propTypes = {
	text: PropTypes.string
};

PropArrayAddNewRow.defaultProps = {
	text: 'Add record'
};

PropArrayAddNewRow.displayName = 'PropArrayAddNewRow';
