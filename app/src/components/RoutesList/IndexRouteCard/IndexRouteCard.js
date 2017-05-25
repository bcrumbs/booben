/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils/misc';

const propTypes = {
  routeId: PropTypes.number.isRequired,
  title: PropTypes.string,
  focused: PropTypes.bool,
  onFocus: PropTypes.func,
  onGo: PropTypes.func,
};

const defaultProps = {
  title: '',
  focused: false,
  onFocus: noop,
  onGo: noop,
};

export class IndexRouteCard extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._element = null;
    
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleCardClick = this._handleCardClick.bind(this);
    this._saveRef = this._saveRef.bind(this);
  }
  
  componentDidMount() {
    this._element.addEventListener('dblclick', this._handleDoubleClick);
  }
  
  componentWillUpdate(nextProps) {
    const { onGo } = this.props;
    
    if (nextProps.onGo !== onGo) {
      this._element.removeEventListener('dblclick', this._handleDoubleClick);
    }
  }
  
  componentDidUpdate(prevProps) {
    const { onGo } = this.props;
    
    if (prevProps.onGo !== onGo) {
      this._element.addEventListener('dblclick', this._handleDoubleClick);
    }
  }
  
  componentWillUnmount() {
    this._element.removeEventListener('dblclick', this._handleDoubleClick);
  }
  
  _handleDoubleClick() {
    const { routeId, onGo } = this.props;
    onGo({ routeId, isIndexRoute: true });
  }
  
  _handleCardClick() {
    const { routeId, onFocus } = this.props;
    onFocus({ routeId, isIndexRoute: true });
  }
  
  _saveRef(el) {
    this._element = el;
  }
  
  render() {
    const { title, focused } = this.props;
    
    let className = 'route-card-wrapper is-index';
    if (focused) className += ' is-focused';
    
    return (
      <li className="route-card-item">
        <div className={className}>
          <div
            className="route-card"
            tabIndex="0"
            onClick={this._handleCardClick}
            ref={this._saveRef}
          >
            <div className="route-card-content">
              <div className="route-title-box">
                <span className="route-title">{title}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }
}

IndexRouteCard.propTypes = propTypes;
IndexRouteCard.defaultProps = defaultProps;
IndexRouteCard.displayName = 'IndexRouteCard';
