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
        backgroundColor: '#555555',
        opacity: '.5'
    };

    return (
        <div style={style} />
    );
};

ContentPlaceholder.displayName = 'ContentPlaceholder';
