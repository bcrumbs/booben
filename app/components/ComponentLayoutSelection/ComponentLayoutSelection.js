'use strict';

import './ComponentLayoutSelection.scss';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';

export const ComponentLayoutSelection = props => (
    <div className="component-layout-selection-wrapper">
        <div className="component-layout-selection-list">
            {props.children}
        </div>
    </div>
);

ComponentLayoutSelection.displayName = 'ComponentLayoutSelection';

export * from './ComponentLayoutSelectionItem/ComponentLayoutSelectionItem';
