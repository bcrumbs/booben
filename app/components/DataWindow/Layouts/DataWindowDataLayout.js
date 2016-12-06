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
					title={`${this.props.linkingPropName} Data`}
					dialogContentFlex
				>
					<div className="data-window_content">
						<BlockContent>
							<BlockContentNavigation isBordered>
								<BlockBreadcrumbs
									items={CONTENT_TYPE.breadcrumbs}
									mode="dark"
									onItemClick={this._handleJumpToCurrentPathIndex}
								/>
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

	backToMainLayout: PropTypes.func,
	setSelectedPath: PropTypes.func
};

DataWindowDataLayout.displayName = 'DataWindowDataLayout';
