'use strict';
import React, { Component, PropTypes } from 'react';
import { combineWithTooltip }
  from '@reactackle/reactackle/components/Tooltip/combineWithTooltip';

const propTypes = {
  tooltipText: PropTypes.string.isRequired,
  hideTooltipAfter: PropTypes.number,

  toggleTooltip: PropTypes.func,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
  isTooltipActive: PropTypes.bool,
  Tooltip: PropTypes.func,
};
const defaultProps = {
};

class BreadcrumbLinkComponent extends Component {
  render() {
    return (
      <div
        onClick={this.props.toggleTooltip}
        onFocus={this.props.showTooltip}
        onBlur={this.props.hideTooltip}
        onMouseEnter={this.props.showTooltip}
        onMouseLeave={this.props.hideTooltip}
        className="breadcrumbs_link-wrapper has-tooltip"
        tabIndex="1"
      >
        { this.props.children }
        <this.props.Tooltip text={this.props.tooltipText}/>
      </div>
    );
  }
}

BreadcrumbLinkComponent.propTypes = propTypes;
BreadcrumbLinkComponent.defaultProps = defaultProps;
BreadcrumbLinkComponent.displayName = 'BreadcrumbLink';

export const BreadcrumbLink = combineWithTooltip(BreadcrumbLinkComponent, true);
