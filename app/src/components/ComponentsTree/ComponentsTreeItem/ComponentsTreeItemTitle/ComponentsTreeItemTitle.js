/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../../utils/misc';

const propTypes = {
  componentId: PropTypes.number.isRequired,
  active: PropTypes.bool,
  hovered: PropTypes.bool,
  title: PropTypes.string,
  elementRef: PropTypes.func,
  onSelect: PropTypes.func,
  onHover: PropTypes.func,
};

const defaultProps = {
  active: false,
  hovered: false,
  title: '',
  elementRef: noop,
  onSelect: noop,
  onHover: noop,
};

const isEllipsisActive = el => el.offsetWidth < el.scrollWidth;

export class ComponentsTreeItemTitle extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._titleElement = null;
    
    this.state = {
      haveTooltip: false,
    };
    
    this._handleHoverIn = this._handleHoverIn.bind(this);
    this._handleHoverOut = this._handleHoverOut.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._saveTitleRef = this._saveTitleRef.bind(this);
  }
  
  componentDidMount() {
    this._updateHaveTooltip();
  }
  
  componentDidUpdate() {
    this._updateHaveTooltip();
  }
  
  _saveTitleRef(ref) {
    const { componentId, elementRef } = this.props;
    this._titleElement = ref;
    elementRef({ componentId, ref });
  }
  
  _handleHoverIn() {
    const { componentId, onHover } = this.props;
    onHover({ componentId, hovered: true });
  }
  
  _handleHoverOut() {
    const { componentId, onHover } = this.props;
    onHover({ componentId, hovered: false });
  }
  
  _handleClick() {
    const { componentId, active, onSelect } = this.props;
    onSelect({ componentId, selected: !active });
  }
  
  _updateHaveTooltip() {
    const { haveTooltip } = this.state;
    
    const needTooltip =
      !!this._titleElement &&
      isEllipsisActive(this._titleElement);
    
    if (needTooltip !== haveTooltip)
      this.setState({ haveTooltip: needTooltip });
  }
  
  render() {
    const { active, hovered, title } = this.props;
    
    let buttonClassName = 'components-tree-item-title-wrapper';
    if (active) buttonClassName += ' is-active';
  
    let titleClassName = 'components-tree-item-title';
    if (hovered) titleClassName += ' is-hovered';
  
    return (
      <button
        className={buttonClassName}
        onFocus={this._handleHoverIn}
        onBlur={this._handleHoverOut}
        onClick={this._handleClick}
      >
        <div
          ref={this._saveTitleRef}
          className={titleClassName}
          onMouseOver={this._handleHoverIn}
          onMouseOut={this._handleHoverOut}
        >
          {title}
        </div>
      </button>
    );
  }
}

ComponentsTreeItemTitle.propTypes = propTypes;
ComponentsTreeItemTitle.defaultProps = defaultProps;
ComponentsTreeItemTitle.displayName = 'ComponentsTreeItemTitle';
