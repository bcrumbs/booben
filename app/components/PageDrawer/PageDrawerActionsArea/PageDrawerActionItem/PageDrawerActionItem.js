'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';

import {
  combineWithTooltip,
} from '@reactackle/reactackle/components/Tooltip/combineWithTooltip';

import { noop } from '../../../../utils/misc';

/*
 * Combined with tooltip
 */

const propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  isActive: PropTypes.bool,
  onPress: PropTypes.func,

  toggleTooltip: PropTypes.func,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
  isTooltipActive: PropTypes.bool,
  Tooltip: PropTypes.func,
};

const defaultProps = {
  icon: null,
  title: null,
  isActive: false,
  onPress: noop,
};

class PageDrawerActionItemComponent extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const { props } = this;

    let className = 'page-drawer-action-item';
    if (props.isActive) className += ' is-active';

    let tooltip = null,
      button = null;

    if (props.icon) {
      button = <Button icon={props.icon} onPress={props.onPress} />;

      className += ' has-tooltip';
    } else {
      button = <Button text={props.title} onPress={props.onPress} />;
    }


    return (
      <div
        className={className}
        onMouseEnter={props.showTooltip}
        onMouseLeave={props.hideTooltip}
      >
        {button}
        <props.Tooltip text={props.title} />
      </div>
    );
  }
}

PageDrawerActionItemComponent.propTypes = propTypes;
PageDrawerActionItemComponent.defaultProps = defaultProps;
PageDrawerActionItemComponent.displayName = 'PageDrawerActionItem';

export const PageDrawerActionItem =
  combineWithTooltip(PageDrawerActionItemComponent, true);
