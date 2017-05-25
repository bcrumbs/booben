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
  id: PropTypes.string.isRequired,
  caption: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func,
};

const defaultProps = {
  caption: '',
  title: '',
  type: '',
  description: '',
  disabled: false,
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
    this._element.addEventListener('click', this._handleClick);
  }
  
  /**
   *
   * @param {HTMLElement} ref
   * @private
   */
  _saveRef(ref) {
    this._element = ref;
  }

  /**
   *
   * @param {MouseEvent} event
   * @private
   */
  _handleClick(event) {
    const { id, disabled, onSelect } = this.props;
    
    event.stopPropagation();
    if (disabled || event.button !== 0) return;
    onSelect({ id });
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
      ? <ItemCaptionStyled disabled={disabled}>{caption}</ItemCaptionStyled>
      : null;
  
    const typeElement = type
      ? <ItemTypeStyled disabled={disabled}>{type}</ItemTypeStyled>
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
