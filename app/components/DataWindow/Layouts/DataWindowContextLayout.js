'use strict';

import React, { PropTypes } from 'react';

import {
	DataWindowQueryLayout
} from './DataWindowQueryLayout';

import {
    getComponentMeta,
    getPropTypedef,
    getNestedTypedef
} from '../../../utils/meta';

import {
	isPrimitiveGraphQLType,
	equalMetaToGraphQLTypeNames,
	FIELD_KINDS
} from '../../../utils/schema';

export class DataWindowContextLayout extends DataWindowQueryLayout {
	constructor(props) {
		super(props);
		this.state = Object.assign(
			{},
			this.state,
			{
				currentPath: [
					{ name: 'Data' },
					props.contextFieldType
				]
			}
		);
	}

	_applyPropData(args = []) {
		const queryPath = this._getCurrentEditingFields(true).concat(
				!this.state.allArgumentsMode
				&&	this.selectedField
				?	[ this.selectedField ]
				:	[]
			).map(pathStep => ({
				field: pathStep.name,
			})
		);

		const queryArgs = args.reduce((acc, currentArg, num) =>
			Object.keys(currentArg).length
			&& !DataWindowContextLayout.allValuesAreNull(currentArg)
			?	Object.assign(acc, {
				[this.props.context]: Object.assign(
					{}, acc[this.props.context], {
						[this.props.contextQueryPath + ' ' + queryPath.slice(0, num + 1)
							.map(({ field }) => field).join(' ')]:
								DataWindowQueryLayout
									.createSourceDataObject(currentArg)
					}
				)
			}, {})
			:	acc
		, {});
		this.props.onUpdateComponentPropValue(
			this.props.linkingPropOfComponentId,
			this.props.linkingPropName,
			this.props.linkingPropPath,
			'data',
			{
				dataContext: [this.props.context],
				queryPath
			}
		);
		this.props.onUpdateComponentQueryArgs(
			this.props.topNestedConstructorComponent.get('id'),
			queryArgs
		);
		this.props.onLinkPropCancel();
	}

	get currentSelectionPath() {
		return this.state.currentPath.slice(2);
	}

	get CONTENT_TYPE() {

		const currentEditingFields = this._getCurrentEditingFields();

		const linkTargetComponent =
			this.props.components.get(this.props.linkingPropOfComponentId);

		const linkTargetComponentMeta = getComponentMeta(
			linkTargetComponent.name,
			this.props.meta
		);

		const linkTargetPropTypedef = getNestedTypedef(
			getPropTypedef(
				linkTargetComponentMeta,
				this.props.linkingPropName
			),
			this.props.linkingPropPath
		);

		this.currentPropType = linkTargetPropTypedef;

		return (
			!this.state.argumentsMode
			?	this.createContentType(
						this.props.schema.types[this._getCurrentPathByIndex(-1).type],
						this._getCurrentPathByIndex(-1),
						this.state.selectedFieldName,
						this.haveArguments(currentEditingFields[0]),
						this.breadcrumbs,
						this._getFieldTypeName,
						this._handleFieldSelect,
						this._handleSetArgumentsPress,
						this._handleDataApplyPress,
						this._handleJumpIntoField,
						this.createContentField,
						linkTargetPropTypedef
					)
			:	this.createContentArgumentsType(
						currentEditingFields,
						this._getCurrentArguments(
							this.state.argumentsForCurrentPathLast,
							this.state.allArgumentsMode
						),
						this._areArgumentsBound(
							currentEditingFields
						),
						this._getCurrentPathByIndex(
							isPrimitiveGraphQLType(
								this._getCurrentPathByIndex(-1).type
							)
						?	-2
						:	-1
						).name,
						this.props.schema.types,
						this.haveArguments,
						this.createContentArgumentField,
						this.setNewArgumentValue,
						this._handleJumpIntoField,
						this._handleBackToPress,
						this._handleArgumentsApplyPress,
						this.state.allArgumentsMode
					)
		);
	}
}

DataWindowContextLayout.propTypes = Object.assign(
	{},
	DataWindowQueryLayout.propTypes,
	{
		contextFieldType: PropTypes.object,
		contextQueryPath: PropTypes.string,
		context: PropTypes.string
	}
);

DataWindowQueryLayout.displayName = 'DataWindowQueryLayout';
