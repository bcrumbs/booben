'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';

import {
  combineWithTooltip,
} from '@reactackle/reactackle/components/Tooltip/combineWithTooltip';

import { noop } from '../../../../utils/misc';

const propTypes = {
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  Tooltip: PropTypes.func.isRequired,
  icon: PropTypes.string,
  title: PropTypes.string,
  isActive: PropTypes.bool,
  onPress: PropTypes.func,
};

const defaultProps = {
  icon: '',
  title: '',
  isActive: false,
  onPress: noop,
};

const PageDrawerActionItemComponent = props => {
  let className = 'page-drawer-action-item';
  if (props.isActive) className += ' is-active';
  
  let button = null;
  if (props.icon) {
    if (props.title) className += ' has-tooltip';
    button = (
      <Button icon={props.icon} onPress={props.onPress} />
    );
  } else {
    button = (
      <Button text={props.title} onPress={props.onPress} />
    );
  }
  
  if (props.title) {
    const TooltipComponent = props.Tooltip;
  
    /* eslint-disable react/jsx-handler-names */
    return (
      <div
        className={className}
        onMouseEnter={props.showTooltip}
        onMouseLeave={props.hideTooltip}
      >
        {button}
        <TooltipComponent text={props.title} />
      </div>
    );
    /* eslint-enable react/jsx-handler-names */
  } else {
    return (
      <div className={className}>
        {button}
      </div>
    );
  }
};

PageDrawerActionItemComponent.propTypes = propTypes;
PageDrawerActionItemComponent.defaultProps = defaultProps;
PageDrawerActionItemComponent.displayName = 'PageDrawerActionItem';

export const PageDrawerActionItem =
  combineWithTooltip(PageDrawerActionItemComponent, true);
