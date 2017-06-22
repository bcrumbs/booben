'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { withTooltip } from '@reactackle/reactackle';
import { BreadcrumbsLinkStyled } from './styles/BreadcrumbsLinkStyled';

const propTypes = {
  tooltipText: PropTypes.string,
};

const defaultProps = {
  tooltipText: '',
};

/* eslint-disable react/jsx-handler-names, react/prop-types */
const BreadcrumbLinkComponent = props => (
  <BreadcrumbsLinkStyled
    onClick={props.toggleTooltip}
    onFocus={props.showTooltip}
    onBlur={props.hideTooltip}
    onMouseEnter={props.showTooltip}
    onMouseLeave={props.hideTooltip}
  >
    {props.children}
    <props.Tooltip text={props.tooltipText} />
  </BreadcrumbsLinkStyled>
);
/* eslint-enable react/jsx-handler-names, react/prop-types */

BreadcrumbLinkComponent.propTypes = propTypes;
BreadcrumbLinkComponent.defaultProps = defaultProps;
BreadcrumbLinkComponent.displayName = 'BreadcrumbLink';

export const BreadcrumbLink = withTooltip(BreadcrumbLinkComponent, true);
