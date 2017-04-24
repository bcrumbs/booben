'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';

import './ComponentsTreeItem.scss';

const propTypes = {
  componentId: PropTypes.number.isRequired,
  title: PropTypes.string,
  active: PropTypes.bool,
  expanded: PropTypes.bool,
  hovered: PropTypes.bool,
  onExpand: PropTypes.func,
  onSelect: PropTypes.func,
  onHover: PropTypes.func,
  titleRef: PropTypes.func,
};

const defaultProps = {
  title: '',
  active: false,
  expanded: false,
  hovered: false,
  onExpand: noop,
  onSelect: noop,
  onHover: noop,
  titleRef: noop,
};

const isEllipsisActive = el => el.offsetWidth < el.scrollWidth;

export class ComponentsTreeItem extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      haveTooltip: false,
    };

    this._titleRef = null;

    this._handleExpand = event => this.props.onExpand(
      this.props.componentId,
      !this.props.expanded,
      event,
    );
    
    this._handleSelect = event => this.props.onSelect(
      this.props.componentId,
      !this.props.active,
      event,
    );
    
    this._handleHoverIn = event => this.props.onHover(
      this.props.componentId,
      true,
      event,
    );
    
    this._handleHoverOut = event => this.props.onHover(
      this.props.componentId,
      false,
      event,
    );
    
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
    this.props.titleRef(this.props.componentId, ref);
  }

  render() {
    const { title, expanded, active, hovered, children } = this.props;

    let className = 'components-tree-item';
    className += expanded ? ' sublevel-is-visible' : ' sublevel-is-hidden';

    let buttonClassName = 'components-tree-item-title-wrapper';
    
    if (active) {
      buttonClassName += ' is-active';
      className += ' item-is-active';
    }

    let content = null;
    let icon = null;

    if (children) {
      if (expanded) {
        content = (
          <div className="components-tree-item-sublevel">
            {children}
          </div>
        );
      }

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
    if (hovered) titleClassName += ' is-hovered';

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
          >
            <div
              ref={this._createTitleRef}
              className={titleClassName}
              onMouseOver={this._handleHoverIn}
              onMouseOut={this._handleHoverOut}
            >
              {title}
            </div>
          </button>
        </div>

        {content}
      </li>
    );
  }
}

ComponentsTreeItem.propTypes = propTypes;
ComponentsTreeItem.defaultProps = defaultProps;
ComponentsTreeItem.displayName = 'ComponentsTreeItem';
