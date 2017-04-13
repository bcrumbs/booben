/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@reactackle/reactackle';
import ProjectRoute from '../../../models/ProjectRoute';
import { noop } from '../../../utils/misc';

const propTypes = {
  route: PropTypes.instanceOf(ProjectRoute).isRequired,
  focused: PropTypes.bool,
  onFocus: PropTypes.func,
  onGo: PropTypes.func,
};

const defaultProps = {
  focused: false,
  onFocus: noop,
  onGo: noop,
};

export class RouteCard extends PureComponent {
  constructor(props) {
    super(props);
    this._element = null;
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleCardClick = this._handleCardClick.bind(this);
    this._saveRef = this._saveRef.bind(this);
  }
  
  componentDidMount() {
    this._element.addEventListener('dblclick', this._handleDoubleClick);
  }
  
  componentWillUpdate(nextProps) {
    if (nextProps.onGo !== this.props.onGo)
      this._element.removeEventListener('dblclick', this._handleDoubleClick);
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.onGo !== this.props.onGo)
      this._element.addEventListener('dblclick', this._handleDoubleClick);
  }
  
  componentWillUnmount() {
    this._element.removeEventListener('dblclick', this._handleDoubleClick);
  }
  
  _handleDoubleClick() {
    this.props.onGo({
      routeId: this.props.route.id,
      isIndexRoute: false,
    });
  }
  
  _handleCardClick() {
    this.props.onFocus({
      routeId: this.props.route.id,
      isIndexRoute: false,
    });
  }

  _saveRef(el) {
    this._element = el;
  }

  render() {
    const { route, focused, children } = this.props;
    
    let className = 'route-card-wrapper';
    if (route.haveRedirect) className += ' has-redirect';
    if (focused) className += ' is-focused';

    let icon = null;
    if (route.haveRedirect) {
      icon = (
        <div className="route-icon">
          <Icon name="random" />
        </div>
      );
    }
    
    const title = route.title || route.path;

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
                {icon}
              </div>
  
              <div className="route-subtitle">
                {route.path}
              </div>
            </div>
          </div>
        </div>

        {children}
      </li>
    );
  }
}

RouteCard.propTypes = propTypes;
RouteCard.defaultProps = defaultProps;
RouteCard.displayName = 'RouteCard';
