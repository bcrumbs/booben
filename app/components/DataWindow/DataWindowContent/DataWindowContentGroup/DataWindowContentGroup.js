'use strict';
import React, { PureComponent, PropTypes } from 'react';

import {
    BlockContentBoxItem,
    BlockContentBoxHeading
} from '../../../BlockContent/BlockContent';

export const DataWindowContentGroup= props => {
    return (
        <div className="data-window_content-group">
            <div className="data-window_content-group_heading">
                {props.title}
            </div>
            <div className="data-window_content-group_content">
                {props.children}
            </div>
        </div>
    );
};

DataWindowContentGroup.propTypes = {
	title: PropTypes.string
};

DataWindowContentGroup.defaultProps = {
	title: ''
};

DataWindowContentGroup.displayName = 'DataWindowContentGroup';
