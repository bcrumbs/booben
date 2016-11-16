'use strict';

import React, { PureComponent, PropTypes } from 'react';
import { Button }  from '@reactackle/reactackle';
import { combineWithTooltip } from '@reactackle/reactackle/components/Tooltip/Tooltip';

/*
 * Combined with tooltip
 */

const
  propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    isActive: PropTypes.bool,
    onPress: PropTypes.func
  },
  defaultProps = {
    icon: null,
    title: null,
    isActive: false,
    onPress: () => /* istanbul ignore next */ {}
  };

class PageDrawerActionItemComponent extends PureComponent {
  constructor(props){
    super(props);
  }
  render() {
      const { props } = this;

      let className = `page-drawer-action-item`;
      if (props.isActive) className += ' is-active';

      let tooltip = null,
          button = null;

      if (props.icon) {
          button = <Button icon={props.icon} onPress={props.onPress}/>;

          className += ' has-tooltip';
      }
      else {
          button = <Button text={props.title} onPress={props.onPress} />;
      }

      return (
          <div className={className}
            onMouseEnter={this._showTooltip}
            onMouseLeave={this._hideTooltip}
          >
              {button}
              <this.Tooltip text={props.title}/>
          </div>
      );
  };
}

PageDrawerActionItemComponent.propTypes = propTypes;
PageDrawerActionItemComponent.defaultProps = defaultProps;
PageDrawerActionItemComponent.displayName = 'PageDrawerActionItem';

export const PageDrawerActionItem = combineWithTooltip(PageDrawerActionItemComponent, true);
