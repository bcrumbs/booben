import React from 'react';
import PropTypes from 'prop-types';
import { withTooltip } from '@reactackle/reactackle';
import { IconCheck, IconExclamation } from '../icons';
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
  Tooltip: PropTypes.func.isRequired,
};

const defaultProps = {
  status: 'default',
  title: '',
  tooltipText: '',
};

const _ProjectSave = props => {
  let icon = null;

  if (props.status === 'error') {
    icon = <IconExclamation />;
  } else if (props.status === 'success') {
    icon = <IconCheck />;
  } else if (props.status === 'progress') {
    icon = null;
  } else {
    icon = <IconCheck />;
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

_ProjectSave.propTypes = propTypes;
_ProjectSave.defaultProps = defaultProps;
_ProjectSave.displayName = 'ProjectSave';

export const ProjectSave = withTooltip(_ProjectSave, true);
