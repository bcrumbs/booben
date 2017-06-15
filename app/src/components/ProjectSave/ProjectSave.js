'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Icon, withTooltip } from '@reactackle/reactackle';
import './ProjectSave.scss';

const propTypes = {
  status: PropTypes.oneOf(['error', 'success', 'progress', 'default']),
  title: PropTypes.string,
  tooltipText: PropTypes.string,
  toggleTooltip: PropTypes.func.isRequired,
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  Tooltip: PropTypes.func.isRequired,
};

const defaultProps = {
  status: 'default',
  title: '',
  tooltipText: '',
};

const ProjectSaveComponent = props => {
  let className = 'project-save has-tooltip';
  if (props.status) className += ` save-status-${props.status}`;
  
  let icon = null;
  
  if (props.status === 'error') {
    icon = <Icon name="exclamation" size="inherit" color="inherit" />;
  } else if (props.status === 'success') {
    icon = <Icon name="check" size="inherit" color="inherit" />;
  } else if (props.status === 'progress') {
    icon = null;
  } else {
    icon = <Icon name="check" size="inherit" color="inherit" />;
  }
  
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
        {icon}
      </div>

      <div className="project-save_title-wrapper">
        <div className="project-save_title">
          {props.title}
        </div>
      </div>
      
      <TooltipComponent text={props.tooltipText} />
    </div>
  );
  /* eslint-enable react/jsx-handler-names */
};

ProjectSaveComponent.propTypes = propTypes;
ProjectSaveComponent.defaultProps = defaultProps;
ProjectSaveComponent.displayName = 'ProjectSave';

export const ProjectSave = withTooltip(ProjectSaveComponent, true);
