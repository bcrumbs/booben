import React, { Component } from 'react';
import { MenuOverlappingStyled } from './styles/MenuOverlappingStyled';

export class MenuOverlapping extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._element = null;
    
    this._saveRef = this._saveRef.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
  }
  
  componentDidMount() {
    this._element.addEventListener('click', this._handleClick);
  }
  
  _saveRef(ref) {
    this._element = ref;
  }
  
  _handleClick(event) {
    event.stopPropagation();
  }
  
  _handleMouseMove(event) {
    event.preventDefault();
  }
  
  render() {
    const { children } = this.props;
    
    return (
      <MenuOverlappingStyled innerRef={this._saveRef}>
        {children}
      </MenuOverlappingStyled>
    );
  }
}

MenuOverlapping.displayName = 'MenuOverlapping';

export * from './MenuOverlappingDivider/MenuOverlappingDivider';
export * from './MenuOverlappingGroup/MenuOverlappingGroup';
