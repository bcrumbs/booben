'use strict';

import React, { PropTypes } from 'react';

export const ComponentTagWrapper = props => {
    let className = 'component-tags-wrapper';

    return (
        <div
            className={className}
        >
	        {props.children}
        </div>
    );
};

ComponentTagWrapper.propTypes = {
};

ComponentTagWrapper.defaultProps = {
};

ComponentTagWrapper.displayName = 'ComponentTagWrapper';


