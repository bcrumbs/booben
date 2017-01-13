/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ProjectRoute from '../../../models/ProjectRoute';
import { noop } from '../../../utils/misc';

//noinspection JSUnresolvedVariable
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

export class IndexRouteCard extends PureComponent {
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
      route: this.props.route,
      isIndexRoute: true,
    });
  }
  
  _handleCardClick() {
    this.props.onFocus({
      route: this.props.route,
      isIndexRoute: true,
    });
  }
  
  _saveRef(el) {
    this._element = el;
  }
  
  render() {
    let className = 'route-card-wrapper is-index';
    if (this.props.focused) className += ' is-focused';
    
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
                <span className="route-title">Index</span>
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
