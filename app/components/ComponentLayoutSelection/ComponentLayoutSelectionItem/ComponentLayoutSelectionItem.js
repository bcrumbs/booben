'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { noop } from '../../../utils/misc';

export class ComponentLayoutSelectionItem extends PureComponent {
  constructor(props) {
    super(props);
    
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

ComponentLayoutSelectionItem.propTypes = {
  layoutIdx: PropTypes.number,
  image: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onSelect: PropTypes.func,
};

ComponentLayoutSelectionItem.defaultProps = {
  layoutIdx: -1,
  image: '',
  title: '',
  subtitle: '',
  onSelect: noop,
};

ComponentLayoutSelectionItem.displayName = 'ComponentLayoutSelectionItem';
