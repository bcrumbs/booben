
'use strict';

import React, { PureComponent, PropTypes } from 'react';

import {
	linkPropCancel,
	updateComponentPropValue
}	from '../../actions/project';

import {
	connect
} from 'react-redux';

import {
    currentComponentsSelector
} from '../../selectors';

import {
	DataWindowDataLayout
} from './Layouts/DataWindowDataLayout';

import {
	DataWindowQueryLayout
} from './Layouts/DataWindowQueryLayout';

import './DataWindow.scss';

class DataWindowComponent extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			selectedPath: void 0,
		};
		this._setSelectedPath = this._setSelectedPath.bind(this);
		this._backToMainLayout = this._backToMainLayout.bind(this);
	}

	_setSelectedPath(selectedPath) {
		this.setState({ selectedPath });
	}

	_backToMainLayout() {
		this.setState({ selectedPath: void 0 });
	}

	render() {
		const component =
			this.state.selectedPath === 'Query'
			?	DataWindowQueryLayout
			:	DataWindowDataLayout;


		return React.createElement(
			component,
			Object.assign(
				{},
				this.props,
				{
					backToMainLayout: this._backToMainLayout,
					setSelectedPath: this._setSelectedPath
				}
			)
		);
	}
}


DataWindowComponent.propTypes = {
	possiblePropDataTypes: PropTypes.arrayOf(PropTypes.string),

	schema: PropTypes.object,
	meta: PropTypes.object,
	linkingProp: PropTypes.bool,
	linkingPropOfComponentId: PropTypes.number,
	linkingPropName: PropTypes.string,
	linkingPropPath: PropTypes.array,
	language: PropTypes.string,
};

DataWindowComponent.defaultProps = {
	dialogTitle: 'InitialComponent — PropName'
};

DataWindowComponent.displayName = 'DataWindow';

const mapStateToProps = state => ({
	schema: state.project.schema,
	meta: state.project.meta,
	linkingProp: state.project.linkingProp,
	linkingPropOfComponentId: state.project.linkingPropOfComponentId,
	linkingPropName: state.project.linkingPropName,
	linkingPropPath: state.project.linkingPropPath,
	language: state.app.language,
	components: currentComponentsSelector(state)
});

const mapDispatchToProps = dispatch => ({
	onLinkPropCancel: () =>
        void dispatch(linkPropCancel()),
	onUpdateComponentPropValue: (...args) =>
		void dispatch(updateComponentPropValue(...args))
});

export const DataWindow = connect(
	mapStateToProps,
	mapDispatchToProps
)(DataWindowComponent);
