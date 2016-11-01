'use strict';

import React, { Component, PropTypes } from 'react';
import { Button }  from '@reactackle/reactackle';
import { combineWithTooltip } from '@reactackle/reactackle/components/Tooltip/Tooltip';

class PageDrawerActionItemComponent extends Component {
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
      console.log(this.Tooltip)
      return (
          <div className={className}
            onFocus={this._showTooltip}
            onBlur={this._hideTooltip}
            onMouseEnter={this._showTooltip}
            onMouseLeave={this._hideTooltip}
          >
              {button}
              <this.Tooltip text={props.title}/>
          </div>
      );
  };
}

PageDrawerActionItemComponent.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    isActive: PropTypes.bool,
    onPress: PropTypes.func
};

PageDrawerActionItemComponent.defaultProps = {
    icon: null,
    title: null,
    isActive: false,
    onPress: () => /* istanbul ignore next */ {}
};

PageDrawerActionItemComponent.displayName = 'PageDrawerActionItem';

console.log(combineWithTooltip + [])
export const PageDrawerActionItem = combineWithTooltip(PageDrawerActionItemComponent, true);
