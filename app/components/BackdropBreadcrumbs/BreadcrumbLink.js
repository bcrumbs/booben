'use strict';

// TODO: Clean up this mess

import React from 'react';
import PropTypes from 'prop-types';

import {
  combineWithTooltip,
} from '@reactackle/reactackle/components/Tooltip/combineWithTooltip';

const propTypes = {
  tooltipText: PropTypes.string,
};

const defaultProps = {
  tooltipText: '',
};

/* eslint-disable react/jsx-handler-names, react/prop-types */
const BreadcrumbLinkComponent = props => (
  <div
    onClick={props.toggleTooltip}
    onFocus={props.showTooltip}
    onBlur={props.hideTooltip}
    onMouseEnter={props.showTooltip}
    onMouseLeave={props.hideTooltip}
    className="breadcrumbs_link-wrapper has-tooltip"
  >
    {props.children}
    <props.Tooltip text={props.tooltipText} />
  </div>
);
/* eslint-enable react/jsx-handler-names, react/prop-types */

BreadcrumbLinkComponent.propTypes = propTypes;
BreadcrumbLinkComponent.defaultProps = defaultProps;
BreadcrumbLinkComponent.displayName = 'BreadcrumbLink';

export const BreadcrumbLink = combineWithTooltip(BreadcrumbLinkComponent, true);
