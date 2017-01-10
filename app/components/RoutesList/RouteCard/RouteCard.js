/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Icon } from '@reactackle/reactackle';
import { noop } from '../../../utils/misc';

const propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  isIndex: PropTypes.bool,
  redirect: PropTypes.bool,
  focused: PropTypes.bool,
  onFocus: PropTypes.func,
  onGo: PropTypes.func,
};

const defaultProps = {
  title: '',
  subtitle: '',
  isIndex: false,
  redirect: false,
  focused: false,
  onFocus: noop,
  onGo: noop,
};

export class RouteCard extends PureComponent {
  constructor(props) {
    super(props);
    this._element = null;
    this._saveRef = this._saveRef.bind(this);
  }
  
  componentDidMount() {
    this._element.addEventListener('dblclick', this.props.onGo);
  }
  
  componentWillUpdate(nextProps) {
    if (nextProps.onGo !== this.props.onGo)
      this._element.removeEventListener('dblclick', this.props.onGo);
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.onGo !== this.props.onGo)
      this._element.addEventListener('dblclick', this.props.onGo);
  }
  
  componentWillUnmount() {
    this._element.removeEventListener('dblclick', this.props.onGo);
  }

  _saveRef(el) {
    this._element = el;
  }

  render() {
    let className = 'route-card-wrapper';
    if (this.props.redirect) className += ' has-redirect';
    if (this.props.isIndex) className += ' is-index';
    if (this.props.focused) className += ' is-focused';

    let icon = null;
    if (this.props.redirect) {
      icon = (
        <div className="route-icon">
          <Icon name="random" />
        </div>
      );
    }

    let subtitle = null;
    if (this.props.subtitle && !this.props.isIndex) {
      subtitle = (
        <div className="route-subtitle">
          {this.props.subtitle}
        </div>
      );
    }

    return (
      <li className="route-card-item">
        <div className={className}>
          <div
            className="route-card"
            tabIndex="0"
            onClick={this.props.onFocus}
            ref={this._saveRef}
          >
            <div className="route-card-content">
              <div className="route-title-box">
                <span className="route-title">{this.props.title}</span>
                {icon}
              </div>

              {subtitle}
            </div>
          </div>
        </div>

        {this.props.children}
      </li>
    );
  }
}

RouteCard.propTypes = propTypes;
RouteCard.defaultProps = defaultProps;
RouteCard.displayName = 'RouteCard';
