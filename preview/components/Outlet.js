/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

// TODO: Style me

export const Outlet = () => {
    const style = {
        width: '100%',
        minHeight: '20px',
        backgroundColor: 'gray',
        boxSizing: 'border-box'
    };

    return (
        <div style={style}>
            Outlet (style me!)
        </div>
    );
};

Outlet.displayName = 'Outlet';
