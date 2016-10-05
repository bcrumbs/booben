'use strict';

import React, { Component, PropTypes } from 'react';

import {
	Button,
	Dialog
} from '@reactackle/reactackle';

import './LayoutSelection.scss';

export const LayoutSelection= props => {


    return (
        <div className="layout-selection-modal-wrapper">
	        <Dialog
		        visible
		        haveCloseButton={false}
		        title="Choose Layout"
	        >
		        <div className="layout-selection-wrapper">
			        <div className="layout-selection-list">
		                { props.children }
	                </div>
	            </div>
	        </Dialog>
        </div>
    );
};

LayoutSelection.propTypes = {

};

LayoutSelection.defaultProps = {
};

LayoutSelection.displayName = 'LayoutSelection';

export * from './LayoutSelectionItem/LayoutSelectionItem';