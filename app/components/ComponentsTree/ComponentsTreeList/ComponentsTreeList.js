'use strict';

import React, { PropTypes } from 'react';

export const ComponentsTreeList = props => (
    <ul className="components-tree-list">
        {props.children}
    </ul>
);

ComponentsTreeList.displayName = 'ComponentsTreeList';

