'use strict';
import React, {Component, PropTypes} from 'react';
import {
	Icon,
	Tooltip
} from '@reactackle/reactackle';

import { combineWithTooltip } from
	'@reactackle/reactackle/components/Tooltip/combineWithTooltip';

import './ProjectSave.scss';

/*
 * Combined with tooltip
 */

const
	propTypes = {
		status: PropTypes.oneOf(["error", "success", "progress", "default"]),

		toggleTooltip: PropTypes.func,
		showTooltip: PropTypes.func,
		hideTooltip: PropTypes.func,
		isTooltipActive: PropTypes.bool,
		Tooltip: PropTypes.func,
	},
	defaultProps = {
		status: 'default'
	};

class ProjectSaveComponent extends Component {
	render () {
		let className = "project-save has-tooltip";
		if (this.props.status)className += ' save-status-' +this. props.status;

		let icon = null,
			title = null,
			tooltipText = null;

		if (this.props.status === "error") {
			title = "Save";
			icon =
				<div className="project-save_state_icon state_icon-error">
					<Icon name="exclamation"/>
				</div>;
		} else if (this.props.status === "success") {
			title = "Saved!";
		} else if (this.props.status === "progress") {
			title = "Saving...";
		} else {
			title = "Save"
		}

		if (this.props.status === "error") {
			tooltipText = "Fix your internet connection and retry";
		} else if (this.props.status === "success") {
			tooltipText = "Last saved a second ago"
		} else {
			tooltipText = "Last saved at 12:56 12/11/2016"
		}

		return (
			<div
				className={className}
				onClick={this.props.toggleTooltip}
				onFocus={this.props.showTooltip}
				onBlur={this.props.hideTooltip}
				onMouseEnter={this.props.showTooltip}
				onMouseLeave={this.props.hideTooltip}
			>
				<div className="project-save_icon">
					<Icon name="floppy-o"/>
				</div>
				<div className="project-save_title-wrapper">
					<div className="project-save_title">
						{ title }
						{ icon }
					</div>
				</div>

				<this.props.Tooltip text={tooltipText}/>
			</div>
		);
	}
}

ProjectSaveComponent.propTypes = propTypes;
ProjectSaveComponent.defaultProps = defaultProps;
ProjectSaveComponent.displayName = 'ProjectSave';

export const ProjectSave = combineWithTooltip(ProjectSaveComponent, true);
