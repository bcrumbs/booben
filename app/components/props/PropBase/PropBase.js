/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Icon, Checkbox } from '@reactackle/reactackle';
import { PropLabel } from './PropLabel/PropLabel';
import { PropImage } from './PropImage/PropImage';
import { PropAction } from './PropAction/PropAction';
import { noop } from '../../../utils/misc';

const propTypes = {
  label: PropTypes.string,
  secondaryLabel: PropTypes.string,
  image: PropTypes.string,
  tooltip: PropTypes.string,
  message: PropTypes.string,
  linkable: PropTypes.bool,
  required: PropTypes.bool,
  requirementFulfilled: PropTypes.bool,
  checkable: PropTypes.bool,
  checked: PropTypes.bool,
  deletable: PropTypes.bool,

  onLink: PropTypes.func,
  onCheck: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  label: '',
  secondaryLabel: '',
  image: '',
  tooltip: '',
  message: '',
  linkable: false,
  required: false,
  requirementFulfilled: false,
  disabled: false,
  checkable: false,
  checked: false,
  deletable: false,

  onLink: noop,
  onCheck: noop,
  onDelete: noop,
};

/**
 * @typedef {Object} PropActionObject
 * @property {string} id
 * @property {string} icon
 * @property {Function} handler
 */

export class PropBase extends PureComponent {
  /**
   *
   * @return {string[]}
   * @private
   */
  _getAdditionalClassNames() {
    return [];
  }

  /**
   *
   * @return {string[]}
   * @private
   */
  _getAdditionalWrapperClassNames() {
    return [];
  }

  /**
   *
   * @return {PropActionObject[]}
   * @private
   */
  _getAdditionalActions() {
    return [];
  }

  /**
   *
   * @return {?(ReactElement|ReactElement[])}
   * @abstract
   * @private
   */
  _renderContent() {
    throw new Error('Do not use PropBase class directly.');
  }

  render() {
    let className = 'prop-item',
      wrapperClassName = 'prop-item-wrapper';

    let label = null;
    if (this.props.label) {
      let requireMark = null;
      if (this.props.required) {
        wrapperClassName += ' is-required';
    
        let markIcon = null;
        if (this.props.requirementFulfilled) {
          className += ' requirement-is-fullfilled';
      
          markIcon = (
            <Icon name="check" />
          );
        } else {
          markIcon = (
            <Icon name="exclamation" />
          );
        }
    
        requireMark = (
          <div className="prop-item_require-mark">
            <div className="require-mark">
              {markIcon}
            </div>
          </div>
        );
      }
      
      label = (
        <div className="prop-item_label-box">
          {requireMark}
        
          <PropLabel
            label={this.props.label}
            secondaryLabel={this.props.secondaryLabel}
            tooltip={this.props.tooltip}
          />
        </div>
      );
    }
  
    let image = null;
    if (this.props.image) {
      image = (
        <PropImage src={this.props.image} />
      );
    
      wrapperClassName += ' has-image';
    }
  
    let actionsLeft = null;
    if (this.props.deletable) {
      actionsLeft = (
        <div className="prop_actions prop_actions-left">
          <PropAction
            id="collapse"
            icon="times"
            onPress={this.props.onDelete}
          />
        </div>
      );
    }
    
    let message = null;
    if (this.props.message) {
      message = (
        <div className="prop-item_message-wrapper">
          {this.props.message}
        </div>
      );
    }
  
    let checkbox = null;
    if (this.props.checkable) {
      checkbox = (
        <div className="prop_subcomponent prop_subcomponent-left">
          <Checkbox
            checked={this.props.checked}
            onCheck={this.props.onCheck}
          />
        </div>
      );
    }
    
    const content = this._renderContent();
    className += ` ${this._getAdditionalClassNames().join(' ')}`;
    wrapperClassName += ` ${this._getAdditionalWrapperClassNames().join(' ')}`;
    
    const actionItemsRight = this._getAdditionalActions().map(actionData => (
      <PropAction
        key={actionData.id}
        id={actionData.id}
        icon={actionData.icon}
        onPress={actionData.handler}
      />
    ));
    
    if (this.props.linkable) {
      const linkAction = (
        <PropAction
          key="linking"
          id="linking"
          icon="link"
          onPress={this.props.onLink}
        />
      );
      
      actionItemsRight.push(linkAction);
    }
    
    let actionsRight = null;
    if (actionItemsRight.length) {
      actionsRight = (
        <div className="prop_actions prop_actions-right">
          {actionItemsRight}
        </div>
      );
    }
    
    return (
      <div className={className}>
        <div className={wrapperClassName}>
          {checkbox}
          {actionsLeft}
          {image}
        
          <div className="prop-item-content-box">
            {label}
            
            <div className="prop-item_value-wrapper">
              {message}
            </div>
          
            <div className="prop-item_value-wrapper">
              {content}
            </div>
          </div>
        
          {actionsRight}
        </div>
      
        {this.props.children}
      </div>
    );
  }
}

PropBase.propTypes = propTypes;
PropBase.defaultProps = defaultProps;
PropBase.displayName = 'PropBase';
