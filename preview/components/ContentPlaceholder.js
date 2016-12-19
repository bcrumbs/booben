/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

export const ContentPlaceholder = () => {
    const style = {
        width: '100%',
        height: '100%',
        minHeight: '20px',
        flexGrow: '1',
        backgroundColor: 'rgba(0, 113, 216, 0.2)',
        border: '1px solid #fff',
        boxSizing: 'border-box'
    };

    return (
        <div style={style} />
    );
};

ContentPlaceholder.displayName = 'ContentPlaceholder';
