'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import {
    Button,
    Tooltip,
} from '@reactackle/reactackle';

import { noop } from '../../../utils/misc';

const isEllipsisActive = el => el.offsetWidth < el.scrollWidth;

export class ComponentsTreeItem extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      haveTooltip: false,
    };

    this._titleRef = null;

    this._handleExpand = event =>
      this.props.onExpand(this.props.componentId, !this.props.expanded, event);
    this._handleSelect = event =>
      this.props.onSelect(this.props.componentId, !this.props.active, event);
    this._handleHoverIn = event =>
      this.props.onHover(
        this.props.componentId,
        true,
        event,
      );
    this._handleHoverOut = event =>
      this.props.onHover(
        this.props.componentId,
        false,
        event,
      );
    this._handleMouseDown = event =>
      this.props.onMouseDown(this.props.componentId, event);
    this._createItemRef = ref =>
      this.props.createItemRef(this.props.componentId, ref);
    this._createTitleRef = this._createTitleRef.bind(this);
  }

  componentDidMount() {
    this._updateHaveTooltip();
  }

  componentDidUpdate() {
    this._updateHaveTooltip();
  }

  _updateHaveTooltip() {
    const needTooltip = !!this._titleRef && isEllipsisActive(this._titleRef);

    if (needTooltip !== this.state.haveTooltip)
      this.setState({ haveTooltip: true });
  }

  _createTitleRef(ref) {
    this._titleRef = ref;
  }

  render() {
    let className = 'components-tree-item';
    className += this.props.expanded ? ' sublevel-is-visible' : ' sublevel-is-hidden';

    let buttonClassName = 'components-tree-item-title-wrapper',
      tooltip = null;
    if (this.props.active)
      buttonClassName += ' is-active';
    className += ' item-is-active';

        // TODO: Use new tooltip logic from reactackle
        // if (this.state.haveTooltip) {
        //     buttonClassName += ' has-tooltip';
        //     tooltip = <Tooltip text={this.props.title} />;
        // }

    let children = null,
      icon = null;

    if (this.props.children) {
      children = (
        <div className="components-tree-item-sublevel">
          {this.props.children}
        </div>
            );

      icon = (
        <div className="components-tree-item-icon">
          <Button
            icon="chevron-down"
            onPress={this._handleExpand}
          />
        </div>
            );

      className += ' has-sublevel';
    }

    let titleClassName = 'components-tree-item-title';
    if (this.props.hovered) titleClassName += ' is-hovered';


    return (
      <li
        className={className}
      >
        <div className="components-tree-item-content">
          {icon}

          <button
            className={buttonClassName}
            onFocus={this._handleHoverIn}
            onBlur={this._handleHoverOut}
            onClick={this._handleSelect}
            onMouseDown={this._handleMouseDown}
          >
            <div
              ref={
                ref => {
                  this._createTitleRef(ref),
                  this._createItemRef(ref);
                }
              }
              className={titleClassName}
              onMouseOver={this._handleHoverIn}
              onMouseOut={this._handleHoverOut}
            >
              {this.props.title}
            </div>

            {tooltip}
          </button>
        </div>

        {this.props.expanded ? children : null}
      </li>
    );
  }
}

ComponentsTreeItem.propTypes = {
  componentId: PropTypes.number.isRequired,
  title: PropTypes.string,
  active: PropTypes.bool,
  expanded: PropTypes.bool,
  hovered: PropTypes.bool,
  onExpand: PropTypes.func,
  onSelect: PropTypes.func,
  onHover: PropTypes.func,
  onMouseDown: PropTypes.func,
  createItemRef: PropTypes.func,
};

ComponentsTreeItem.defaultProps = {
  title: '',
  active: false,
  expanded: false,
  hovered: false,
  onExpand: noop,
  onSelect: noop,
  onHover: noop,
  onMouseDown: noop,
  createItemRef: noop,
};

ComponentsTreeItem.displayName = 'ComponentsTreeItem';
