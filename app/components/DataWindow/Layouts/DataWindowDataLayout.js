'use strict';

import React, { PureComponent, PropTypes } from 'react';

import {
	Button,
	Breadcrumbs,
    Checkbox,
	Dialog
} from '@reactackle/reactackle';

import {
	BlockContent,
	BlockContentBox,
	BlockContentNavigation,
	BlockContentTitle,
	BlockBreadcrumbs
} from '../../BlockContent/BlockContent';

import {
    PropsList,
    PropsItem
} from '../../PropsList/PropsList';

import {
    DataWindowContent,
    DataWindowContentGroup
} from '../DataWindowContent/DataWindowContent';

import {
	getString,
	getComponentMeta,
	getNestedTypedef,
	getPropTypedef
} from '../../../utils/meta';

const getLastType = (types, type, path) => {
	const pathStep = path.get(0);
	let typeName;
	if (pathStep.includes('/')) {
		const [fieldName, connectionFieldName] = pathStep.split('/');
		typeName = type
					.fields[fieldName]
						.connectionFields[connectionFieldName].type;
	}
	else typeName = type.fields[pathStep].type;

	return path.size === 1
	?	types[typeName]
	:	getLastType(types, types[typeName], path.slice(1));
};

const getAllPossibleContexts = (ownerComponent, currentComponent, context) => {
	return ownerComponent.chi
};

export class DataWindowDataLayout extends PureComponent {
	get CONTENT_TYPE() {
		const ownerComponent = this.props.rootComponentWithQueryArgs;
		let contexts = [];
		console.log(this.props.rootComponentWithQueryArgs)
		console.log(this.props.currentComponentWithQueryArgs);
		if (ownerComponent) {
			const meta = getComponentMeta(ownerComponent.name, this.props.meta);
			const { props } = ownerComponent;
			contexts = Object.keys(meta.props).map(
					propName => {
						const propMeta = meta.props[propName];
						if (propMeta.source.includes('data')) {
							const context = propMeta.sourceConfigs.data.pushDataContext;
							const prop = props.get(propName);
							if (context
								&&	prop.source === 'data'
								&&	prop.sourceData
								&&	prop.sourceData.queryPath
							) {
								const { types, queryTypeName } = this.props.schema;
								const { queryPath } = prop.sourceData;

								const type = getLastType(
									types,
									types[queryTypeName],
									prop.sourceData.queryPath.map(({ field }) => field)
								).name;

								return {
									context,
									contextFieldType: {
										name: type,
										type
									}
								};
							}
						}
						return void 0;
					}
			).filter(v => v);

		}

		return ({
			content: {
				list: [
					{
						title: 'Query',
						actionType: 'jump',
						connection: true,
						onSelect: () => this.props.setSelectedPath('Query')
					},
					{
						title: 'Functions',
						actionType: 'jump',
						connection: true
					},
					{
						title: 'State',
						actionType: 'jump',
						connection: true
					},
				].concat(
					this.props.rootComponentWithQueryArgs
					?	[
						{
							title: 'Owner component',
							actionType: 'jump',
							connection: true,
							onSelect: () => this.props.setSelectedPath('OwnerComponent')
						},
						...contexts.map(({ context, contextFieldType }) =>
							({
								title: `${contextFieldType.name} - context`,
								actionType: 'jump',
								connection: true,
								onSelect:
									() =>
										this.props.setSelectedPath(
											'Context', {
												contextFieldType,
												context
											}
										)
							})
						)
					]
					:	[]
				)
			}
		});
	}

	render() {
		const { CONTENT_TYPE } = this;

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

		const propName =
			getString(
				linkTargetComponentMeta,
				linkTargetPropTypedef.textKey,
				this.props.language
			) || this.props.linkingPropName;

		return (
			<div className="data-window">
				<Dialog
					backdrop
					visible={this.props.linkingProp}
					onClose={this.props.onLinkPropCancel}
					haveCloseButton
					closeOnEscape
					closeOnBackdropClick
					scrollable
					buttonsLeft={CONTENT_TYPE.buttonsLeft}
					buttons={CONTENT_TYPE.buttons}
					paddingSize="none"
					title={`${propName} Data`}
					dialogContentFlex
				>
					<div className="data-window_content">
						<BlockContent>
							<BlockContentNavigation isBordered>
							{
								!!CONTENT_TYPE.breadcrumbs
								&&
									<BlockBreadcrumbs
										items={CONTENT_TYPE.breadcrumbs}
										mode="dark"
										onItemClick={this._handleJumpToCurrentPathIndex}
										overflow={true}
									/>
							}
							</BlockContentNavigation>

							<BlockContentBox isBordered>
								<DataWindowContent
									title={CONTENT_TYPE.content.title}
									type={CONTENT_TYPE.content.type}
									subtitle={CONTENT_TYPE.content.subtitle}
									description={CONTENT_TYPE.content.description}
									contentHeading={CONTENT_TYPE.content.contentHeading}
									argsButton={CONTENT_TYPE.content.argsButton}
									onSetArgumentsClick={
										CONTENT_TYPE.content.onSetArgumentsClick
									}
									list={CONTENT_TYPE.content.list}
									children={CONTENT_TYPE.content.children}
								>

								</DataWindowContent>
							</BlockContentBox>
						</BlockContent>
					</div>
				</Dialog>
			</div>
		);
	}
}


DataWindowDataLayout.propTypes = {
	components: PropTypes.any,
	schema: PropTypes.object,
	meta: PropTypes.object,
	linkingProp: PropTypes.bool,
	linkingPropOfComponentId: PropTypes.number,
	linkingPropName: PropTypes.string,
	linkingPropPath: PropTypes.array,
	language: PropTypes.string,
	currentComponentWithQueryArgs: PropTypes.any,
	rootComponentWithQueryArgs: PropTypes.any,
	topNestedConstructor: PropTypes.any,
	topNestedConstructorComponent: PropTypes.any,

	onLinkPropCancel: PropTypes.func,
	onUpdateComponentPropValue: PropTypes.func,
	onLinkWithOwnerProp: PropTypes.func,

	backToMainLayout: PropTypes.func,
	setSelectedPath: PropTypes.func
};

DataWindowDataLayout.displayName = 'DataWindowDataLayout';
