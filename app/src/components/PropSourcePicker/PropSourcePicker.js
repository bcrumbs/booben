'use strict';

import React, { Component } from 'react';
import './PropSourcePicker.scss';

export class PropSourcePicker extends Component {
  constructor(props, context) {
    super(props, context);
    
    this._element = null;
    
    this._saveRef = this._saveRef.bind(this);
    this._handleClick = this._handleClick.bind(this);
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
  
  render() {
    const { children } = this.props;
    
    return (
      <div className="source-picker" ref={this._saveRef}>
        {children}
      </div>
    );
  }
}

PropSourcePicker.displayName = 'PropSourcePicker';

export * from './SourceDivider/SourceDivider';
export * from './SourceGroup/SourceGroup';
