'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils/misc';

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
      <div className="component-layout-item-subtitle">
        {this.props.subtitle}
      </div>
    );
  }
  
  render() {
    const subtitle = this._renderSubtitle();
  
    return (
      <div className="component-layout-item" onClick={this._handleClick}>
        <div className="component-layout-item-image-box">
          <img src={this.props.image} alt="" role="presentation" />
        </div>
      
        <div className="component-layout-item-title-box">
          <div className="component-layout-item-title">
            {this.props.title}
          </div>
        
          {subtitle}
        </div>
      </div>
    );
  }
}

ComponentLayoutSelectionItem.propTypes = propTypes;
ComponentLayoutSelectionItem.defaultProps = defaultProps;
ComponentLayoutSelectionItem.displayName = 'ComponentLayoutSelectionItem';
