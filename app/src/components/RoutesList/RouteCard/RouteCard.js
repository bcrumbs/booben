/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@reactackle/reactackle';
import ProjectRoute from '../../../models/ProjectRoute';
import { noop } from '../../../utils/misc';
import { RouteCardStyled } from './styles/RouteCardStyled';
import { CardWrapperStyled } from './styles/CardWrapperStyled';
import { CardStyled } from './styles/CardStyled';
import { CardContentStyled } from './styles/CardContentStyled';
import { TitleBoxStyled } from './styles/TitleBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { SubtitleStyled } from './styles/SubtitleStyled';
import { RouteIconStyled } from './styles/RouteIconStyled';
import { AlertMarkStyled } from './styles/AlertMarkStyled';
import { TextBoxStyled } from './styles/TextBoxStyled';
import { MessageStyled } from './styles/MessageStyled';

const propTypes = {
  route: PropTypes.instanceOf(ProjectRoute).isRequired,
  focused: PropTypes.bool,
  alertMark: PropTypes.bool,
  messageComponent: PropTypes.object,
  messageColorScheme: PropTypes.oneOf(['neutral', 'error']),
  onFocus: PropTypes.func,
  onGo: PropTypes.func,
};

const defaultProps = {
  focused: false,
  alertMark: false,
  /*
   * Message example:
   * <span>Before editing this route you should set the outlet in the 'Root
    * route’ first (more about <a href="%docs%">constructing routes</a>)</span>
   */
  messageComponent: null,
  messageColorScheme: 'neutral',
  onFocus: noop,
  onGo: noop,
};

export class RouteCard extends PureComponent {
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
    const { route, onGo } = this.props;
    onGo({ routeId: route.id, isIndexRoute: false });
  }
  
  _handleCardClick() {
    const { route, onFocus } = this.props;
    onFocus({ routeId: route.id, isIndexRoute: false });
  }

  _saveRef(el) {
    this._element = el;
  }

  render() {
    const {
      route,
      focused,
      children,
      alertMark,
      messageComponent,
      messageColorScheme,
    } = this.props;
    
    let icon = null;
    if (route.redirect) {
      icon = (
        <RouteIconStyled>
          <Icon name="random" size="inherit" color="inherit" />
        </RouteIconStyled>
      );
    }
    
    let mark = null;
    if (alertMark) {
      mark = (
        <AlertMarkStyled>
          <Icon name="exclamation" size="inherit" color="inherit" />
        </AlertMarkStyled>
      );
    }
    
    let message = null;
    if (messageComponent) {
      message = (
        <MessageStyled colorScheme={messageColorScheme}>
          {messageComponent}
        </MessageStyled>
      );
    }
    
    const title = route.title || route.path;

    return (
      <RouteCardStyled>
        <CardWrapperStyled focused={focused}>
          <CardStyled
            focused={focused}
            tabIndex="0"
            onClick={this._handleCardClick}
            innerRef={this._saveRef}
          >
            <CardContentStyled focused={focused}>
              <TextBoxStyled>
                <TitleBoxStyled>
                  <TitleStyled>{title}</TitleStyled>
                  {icon}
                </TitleBoxStyled>
    
                <SubtitleStyled>
                  {route.path}
                </SubtitleStyled>
              </TextBoxStyled>
  
              {mark}
            </CardContentStyled>
            
            {message}
            
          </CardStyled>
        </CardWrapperStyled>

        {children}
      </RouteCardStyled>
    );
  }
}

RouteCard.propTypes = propTypes;
RouteCard.defaultProps = defaultProps;
RouteCard.displayName = 'RouteCard';
