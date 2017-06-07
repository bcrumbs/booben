'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TooltipIcon } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';

import {
  MenuOverlappingGroupItemStyled,
} from './styles/MenuOverlappingGroupItemStyled';

import { ItemTitleStyled } from './styles/ItemTitleStyled';
import { ItemTypeStyled } from './styles/ItemTypeStyled';
import { ItemCaptionStyled } from './styles/ItemCaptionStyled';

const propTypes = {
  id: PropTypes.string,
  caption: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  elementRef: PropTypes.func,
  onSelect: PropTypes.func,
};

const defaultProps = {
  id: '',
  caption: '',
  title: '',
  type: '',
  description: '',
  disabled: false,
  elementRef: noop,
  onSelect: noop,
};

export class MenuOverlappingGroupItem extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._element = null;
  
    this._saveRef = this._saveRef.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }
  
  componentDidMount() {
    if (this._element) {
      this._element.addEventListener('click', this._handleClick);
    }
  }
  
  componentWillUpdate() {
    if (this._element) {
      this._element.removeEventListener('click', this._handleClick);
    }
  }
  
  componentDidUpdate() {
    if (this._element) {
      this._element.addEventListener('click', this._handleClick);
    }
  }
  
  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _saveRef(ref) {
    const { elementRef } = this.props;
    
    this._element = ref;
    elementRef(ref);
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleClick(event) {
    const { id, disabled, onSelect } = this.props;
  
    event.stopPropagation();
    
    if (!disabled && event.button === 0) {
      onSelect({ id });
    }
  }

  render() {
    const { caption, title, type, description, disabled } = this.props;

    let tooltipElement = null;
    if (description) {
      tooltipElement = (
        <TooltipIcon text={description} />
      );
    }
    
    const captionElement = caption
      ? (
        <ItemCaptionStyled disabled={disabled}>
          {caption}
        </ItemCaptionStyled>
      )
      : null;
  
    const typeElement = type
      ? (
        <ItemTypeStyled disabled={disabled}>
          {type}
        </ItemTypeStyled>
      )
      : null;

    return (
      <MenuOverlappingGroupItemStyled
        innerRef={this._saveRef}
        disabled={disabled}
      >
        {captionElement}
        
        <div>
          <ItemTitleStyled disabled={disabled}>
            {title}
          </ItemTitleStyled>
  
          {typeElement}
          {tooltipElement}
        </div>
      </MenuOverlappingGroupItemStyled>
    );
  }
}

MenuOverlappingGroupItem.displayName = 'MenuOverlappingGroupItem';
MenuOverlappingGroupItem.propTypes = propTypes;
MenuOverlappingGroupItem.defaultProps = defaultProps;
