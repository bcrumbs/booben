'use strict';

import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {
	linkPropCancel,
	updateComponentPropValue,
	linkWithOwnerProp
}	from '../../actions/project';

import {
	connect
} from 'react-redux';

import {
	getComponentGraphQLQueryArgs,
    currentComponentsSelector,
	singleComponentSelectedSelector,
	topNestedConstructorSelector,
	topNestedConstructorComponentSelector,
} from '../../selectors';

import ProjectComponentRecord from '../../models/ProjectComponent';

import { NestedConstructor } from '../../reducers/project';

import {
	DataWindowDataLayout
} from '../../components/DataWindow/Layouts/DataWindowDataLayout';

import {
	DataWindowQueryLayout
} from '../../components/DataWindow/Layouts/DataWindowQueryLayout';

import {
	DataWindowOwnerComponentLayout
} from '../../components/DataWindow/Layouts/DataWindowOwnerComponentLayout';

import '../../components/DataWindow/DataWindow.scss';

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
			:	this.state.selectedPath === 'OwnerComponent'
				?	DataWindowOwnerComponentLayout
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
	components: ImmutablePropTypes.mapOf(
        PropTypes.instanceOf(ProjectComponentRecord),
        PropTypes.number
    ),
	schema: PropTypes.object,
	meta: PropTypes.object,
	linkingProp: PropTypes.bool,
	linkingPropOfComponentId: PropTypes.number,
	linkingPropName: PropTypes.string,
	linkingPropPath: PropTypes.array,
	language: PropTypes.string,
	queryArgsList: PropTypes.any,
	topNestedConstructor: PropTypes.instanceOf(NestedConstructor),
    topNestedConstructorComponent: PropTypes.instanceOf(ProjectComponentRecord),

	onLinkPropCancel: PropTypes.func,
	onUpdateComponentPropValue: PropTypes.func,
	onLinkWithOwnerProp: PropTypes.func
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
	components: currentComponentsSelector(state),
	queryArgsList: getComponentGraphQLQueryArgs(state),
	singleComponentSelected: singleComponentSelectedSelector(state),
	topNestedConstructor: topNestedConstructorSelector(state),
	topNestedConstructorComponent: topNestedConstructorComponentSelector(state),
});

const mapDispatchToProps = dispatch => ({
	onLinkPropCancel: () =>
        void dispatch(linkPropCancel()),
	onUpdateComponentPropValue: (...args) =>
		void dispatch(updateComponentPropValue(...args)),
	onLinkWithOwnerProp: ownerPropName =>
        void dispatch(linkWithOwnerProp(ownerPropName))
});

export const DataWindow = connect(
	mapStateToProps,
	mapDispatchToProps
)(DataWindowComponent);
