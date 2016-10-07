'use strict';

import React, { Component, PropTypes } from 'react';

import './ComponentLayoutSelection.scss';

export const ComponentLayoutSelection = props => {

    return (
        <div className="component-layout-selection-wrapper">
	        <div className="component-layout-selection-list">
                { props.children }
            </div>
        </div>
    );
};

ComponentLayoutSelection.propTypes = {

};

ComponentLayoutSelection.defaultProps = {
};

ComponentLayoutSelection.displayName = 'ComponentLayoutSelection';

export * from './ComponentLayoutSelectionItem/ComponentLayoutSelectionItem';