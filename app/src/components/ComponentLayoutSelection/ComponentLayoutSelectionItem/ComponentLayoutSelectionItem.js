'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils/misc';
import { LayoutItemStyled } from './styles/LayoutItemStyled';
import { ImageBoxStyled } from './styles/ImageBoxStyled';
import { TitleBoxStyled } from './styles/TitleBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';

const propTypes = {
  layoutIdx: PropTypes.number,
  image: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onSelect: PropTypes.func,
};

const defaultProps = {
  layoutIdx: -1,
  image: '',
  title: '',
  subtitle: '',
  onSelect: noop,
};

export class ComponentLayoutSelectionItem extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._handleClick = this._handleClick.bind(this);
  }
  
  _handleClick() {
    this.props.onSelect({ layoutIdx: this.props.layoutIdx });
  }
  
  _renderSubtitle() {
    if (!this.props.subtitle) return null;
    
    return (
      <SubtitleStyled>
        {this.props.subtitle}
      </SubtitleStyled>
    );
  }
  
  render() {
    const subtitle = this._renderSubtitle();
  
    return (
      <LayoutItemStyled onClick={this._handleClick}>
        <ImageBoxStyled>
          <img src={this.props.image} alt="" role="presentation" />
        </ImageBoxStyled>
      
        <TitleBoxStyled>
          <TitleStyled>
            {this.props.title}
          </TitleStyled>
        
          {subtitle}
        </TitleBoxStyled>
      </LayoutItemStyled>
    );
  }
}

ComponentLayoutSelectionItem.propTypes = propTypes;
ComponentLayoutSelectionItem.defaultProps = defaultProps;
ComponentLayoutSelectionItem.displayName = 'ComponentLayoutSelectionItem';
