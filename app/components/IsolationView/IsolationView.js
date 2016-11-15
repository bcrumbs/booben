'use strict';

import React from 'react';

import './IsolationView.scss';

export const IsolationView = props => (
    <div className="isolation-view">
        {props.children}
    </div>
);

IsolationView.displayName = 'IsolationView';
