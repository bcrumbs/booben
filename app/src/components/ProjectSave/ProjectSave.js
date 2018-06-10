import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTooltip } from 'reactackle-tooltip';
import { IconCheck, IconExclamation } from '../icons';
import { ProjectSaveStyled } from './styles/ProjectSaveStyled';
import { IconStyled } from './styles/IconStyled';
import { TitleStyled } from './styles/TitleStyled';
import { ContentStyled } from './styles/ContentStyled';
import { noop } from '../../utils/misc';

const propTypes = {
  status: PropTypes.oneOf(['error', 'success', 'progress', 'default']),
  title: PropTypes.string,
  tooltipText: PropTypes.string,
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  Tooltip: PropTypes.func.isRequired,
  onShowTooltip: PropTypes.func,
};

const defaultProps = {
  status: 'default',
  title: '',
  tooltipText: '',
  onShowTooltip: noop,
};

class _ProjectSave extends Component {
  constructor(props, context) {
    super(props, context);

    this._handleMouseEnter = this._handleMouseEnter.bind(this);
    this._handleMouseLeave = this._handleMouseLeave.bind(this);
  }

  _handleMouseEnter() {
    this.props.onShowTooltip();
    this.props.showTooltip();
  }

  _handleMouseLeave() {
    this.props.hideTooltip();
  }

  render() {
    const { title, status, tooltipText, Tooltip } = this.props;

    const iconProps = {
      border: true,
      rounded: true,
      borderWidth: 1,
    };

    let icon = null;

    if (status === 'error') {
      icon = <IconExclamation {...iconProps} />;
    } else if (status === 'success') {
      icon = <IconCheck {...iconProps} />;
    } else if (status === 'progress') {
      icon = null;
    } else {
      icon = <IconCheck {...iconProps} />;
    }

    return (
      <ProjectSaveStyled
        onMouseEnter={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        <ContentStyled colorScheme={status}>
          <IconStyled
            typeProgress={status === 'progress'}
            active={status !== 'default'}
          >
            {icon}
          </IconStyled>

          <TitleStyled>
            {title}
          </TitleStyled>
        </ContentStyled>

        <Tooltip>{tooltipText}</Tooltip>
      </ProjectSaveStyled>
    );
  }
}

_ProjectSave.propTypes = propTypes;
_ProjectSave.defaultProps = defaultProps;
_ProjectSave.displayName = 'ProjectSave';

export const ProjectSave = withTooltip(_ProjectSave, true);
