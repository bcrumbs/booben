'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import { Button } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';

export const PropTreeList = props => {
    let addButton = null;
    if (props.addButton) {
        addButton = (
            <div className="prop-tree-item-action-row">
                <Button
                    text={props.addButtonText}
                    icon="plus"
                    size="small"
                    narrow
                    onPress={props.onAdd}
                />
            </div>
        );
    }

    return (
        <div className='prop-tree_list'>
            {props.children}
            {addButton}
        </div>
    );
};

PropTreeList.propTypes = {
    addButton: PropTypes.bool,
    addButtonText: PropTypes.string,

    onAdd: PropTypes.func
};

PropTreeList.defaultProps = {
    addButton: false,
    addButtonText: '',

    onAdd: noop
};

PropTreeList.displayName = 'PropTreeList';
