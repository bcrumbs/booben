import React from 'react';
import PropTypes from 'prop-types';
import { Icon, withTooltip } from '@reactackle/reactackle';
import { ProjectSaveStyled } from './styles/ProjectSaveStyled';
import { IconStyled } from './styles/IconStyled';
import { TitleStyled } from './styles/TitleStyled';
import { ContentStyled } from './styles/ContentStyled';

const propTypes = {
  status: PropTypes.oneOf(['error', 'success', 'progress', 'default']),
  title: PropTypes.string,
  tooltipText: PropTypes.string,
  toggleTooltip: PropTypes.func.isRequired,
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  savedTimestamp: PropTypes.number,
  Tooltip: PropTypes.func.isRequired,
};

const defaultProps = {
  savedTimestamp: null,
  status: 'default',
  title: '',
  tooltipText: '',
};

const ProjectSaveComponent = props => {
  const savedTime = props.savedTimestamp
    ? new Date(props.savedTimestamp).toLocaleString()
    : null;
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
    <ProjectSaveStyled
      onClick={props.toggleTooltip}
      onFocus={props.showTooltip}
      onBlur={props.hideTooltip}
      onMouseEnter={props.showTooltip}
      onMouseLeave={props.hideTooltip}
    >
      <ContentStyled colorScheme={props.status}>
        <IconStyled
          typeProgress={props.status === 'progress'}
          active={props.status !== 'default'}
        >
          {icon}
        </IconStyled>
        
        <TitleStyled>
          {props.title}
        </TitleStyled>
      </ContentStyled>
      
      <TooltipComponent text={props.tooltipText} />
    </ProjectSaveStyled>
  );
  /* eslint-enable react/jsx-handler-names */
};

ProjectSaveComponent.propTypes = propTypes;
ProjectSaveComponent.defaultProps = defaultProps;
ProjectSaveComponent.displayName = 'ProjectSave';

export const ProjectSave = withTooltip(ProjectSaveComponent, true);
