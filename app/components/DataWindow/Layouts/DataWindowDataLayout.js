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

export class DataWindowDataLayout extends PureComponent {
	get CONTENT_TYPE() {
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
						title: 'Context',
						actionType: 'jump',
						connection: true
					},
					{
						title: 'State',
						actionType: 'jump',
						connection: true
					}

				]
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
			);
			
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
	possiblePropDataTypes: PropTypes.arrayOf(PropTypes.string),

	schema: PropTypes.object,
	meta: PropTypes.object,
	linkingProp: PropTypes.bool,
	linkingPropOfComponentId: PropTypes.number,
	linkingPropName: PropTypes.string,
	linkingPropPath: PropTypes.array,
	language: PropTypes.string,

	backToMainLayout: PropTypes.func,
	setSelectedPath: PropTypes.func
};

DataWindowDataLayout.displayName = 'DataWindowDataLayout';
