/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../../utils/misc';
import { TitleWrapperStyled } from './styles/TitleWrapperStyled';
import { TitleStyled } from './styles/TitleStyled';

const propTypes = {
  componentId: PropTypes.number.isRequired,
  active: PropTypes.bool,
  hovered: PropTypes.bool,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  elementRef: PropTypes.func,
  onSelect: PropTypes.func,
  onHover: PropTypes.func,
};

const defaultProps = {
  active: false,
  hovered: false,
  disabled: false,
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
    this._buttonElement = null;
    
    this.state = {
      haveTooltip: false,
    };
    
    this._handleHoverIn = this._handleHoverIn.bind(this);
    this._handleHoverOut = this._handleHoverOut.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._saveTitleRef = this._saveTitleRef.bind(this);
    this._saveButtonRef = this._saveButtonRef.bind(this);
  }
  
  componentDidMount() {
    this._buttonElement.addEventListener('click', this._handleClick);
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
  
  _saveButtonRef(ref) {
    this._buttonElement = ref;
  }
  
  _handleHoverIn() {
    const { componentId, disabled, onHover } = this.props;
    if (!disabled) onHover({ componentId, hovered: true });
  }
  
  _handleHoverOut() {
    const { componentId, disabled, onHover } = this.props;
    if (!disabled) onHover({ componentId, hovered: false });
  }
  
  _handleClick(event) {
    const { componentId, active, disabled, onSelect } = this.props;
    if (!disabled) {
      event.stopPropagation();
      onSelect({ componentId, selected: !active });
    }
  }
  
  _updateHaveTooltip() {
    const { haveTooltip } = this.state;
    
    const needTooltip =
      !!this._titleElement &&
      isEllipsisActive(this._titleElement);
    
    if (needTooltip !== haveTooltip) {
      this.setState({ haveTooltip: needTooltip });
    }
  }
  
  render() {
    const { active, disabled, hovered, title } = this.props;
  
    return (
      <TitleWrapperStyled
        innerRef={this._saveButtonRef}
        onFocus={this._handleHoverIn}
        onBlur={this._handleHoverOut}
      >
        <TitleStyled
          innerRef={this._saveTitleRef}
          hovered={hovered}
          active={active}
          disabled={disabled}
          onMouseOver={this._handleHoverIn}
          onMouseOut={this._handleHoverOut}
        >
          {title}
        </TitleStyled>
      </TitleWrapperStyled>
    );
  }
}

ComponentsTreeItemTitle.propTypes = propTypes;
ComponentsTreeItemTitle.defaultProps = defaultProps;
ComponentsTreeItemTitle.displayName = 'ComponentsTreeItemTitle';
