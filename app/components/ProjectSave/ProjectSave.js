'use strict';

// TODO Get all strings from i18n

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Icon } from '@reactackle/reactackle';

import {
  combineWithTooltip,
} from '@reactackle/reactackle/components/Tooltip/combineWithTooltip';

import './ProjectSave.scss';

/*
 * Combined with tooltip
 */

const propTypes = {
  status: PropTypes.oneOf(['error', 'success', 'progress', 'default']),
  toggleTooltip: PropTypes.func.isRequired,
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  Tooltip: PropTypes.func.isRequired,
};

const defaultProps = {
  status: 'default',
};

const ProjectSaveComponent = props => {
  let className = 'project-save has-tooltip';
  if (props.status)className += ` save-status-${props.status}`;
  
  let icon = null,
    title = null,
    tooltipText = null;
  
  if (props.status === 'error') {
    title = 'Save';
    icon = (
      <div className="project-save_state_icon state_icon-error">
        <Icon name="exclamation" />
      </div>
    );
  } else if (props.status === 'success') {
    title = 'Saved!';
  } else if (props.status === 'progress') {
    title = 'Saving...';
  } else {
    title = 'Save';
  }
  
  if (props.status === 'error')
    tooltipText = 'Fix your internet connection and retry';
  else if (props.status === 'success')
    tooltipText = 'Last saved a second ago';
  else
    tooltipText = 'Last saved at 12:56 12/11/2016';
  
  const TooltipComponent = props.Tooltip;
  
  /* eslint-disable react/jsx-handler-names */
  return (
    <div
      className={className}
      onClick={props.toggleTooltip}
      onFocus={props.showTooltip}
      onBlur={props.hideTooltip}
      onMouseEnter={props.showTooltip}
      onMouseLeave={props.hideTooltip}
    >
      <div className="project-save_icon">
        <Icon name="floppy-o" />
      </div>
      <div className="project-save_title-wrapper">
        <div className="project-save_title">
          {title}
          {icon}
        </div>
      </div>
      
      <TooltipComponent text={tooltipText} />
    </div>
  );
  /* eslint-enable react/jsx-handler-names */
};

ProjectSaveComponent.propTypes = propTypes;
ProjectSaveComponent.defaultProps = defaultProps;
ProjectSaveComponent.displayName = 'ProjectSave';

//noinspection JSCheckFunctionSignatures
export const ProjectSave = combineWithTooltip(ProjectSaveComponent, true);
