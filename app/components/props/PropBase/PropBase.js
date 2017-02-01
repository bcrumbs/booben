/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { Icon, Checkbox, Tag } from '@reactackle/reactackle';
import { PropLabel } from './PropLabel/PropLabel';
import { PropImage } from './PropImage/PropImage';
import { PropAction } from './PropAction/PropAction';
import { noop } from '../../../utils/misc';

const propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  secondaryLabel: PropTypes.string,
  image: PropTypes.string,
  tooltip: PropTypes.string,
  message: PropTypes.string,
  linkable: PropTypes.bool,
  linked: PropTypes.bool,
  linkedWith: PropTypes.string,
  required: PropTypes.bool,
  requirementFulfilled: PropTypes.bool,
  checkable: PropTypes.bool,
  checked: PropTypes.bool,
  deletable: PropTypes.bool,
  onLink: PropTypes.func,
  onUnlink: PropTypes.func,
  onCheck: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  id: '',
  label: '',
  secondaryLabel: '',
  image: '',
  tooltip: '',
  message: '',
  linkable: false,
  linked: false,
  linkedWith: '',
  required: false,
  requirementFulfilled: false,
  checkable: false,
  checked: false,
  deletable: false,
  onLink: noop,
  onUnlink: noop,
  onCheck: noop,
  onDelete: noop,
};

export class PropBase extends PureComponent {
  constructor(props) {
    super(props);
    this._handleCheck = this._handleCheck.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
    this._handleLink = this._handleLink.bind(this);
  }
  
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
   * @return {ReactElement[]}
   * @private
   */
  _renderAdditionalActions() {
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
  
  /**
   *
   * @return {ReactElement}
   * @private
   */
  _renderLinked() {
    //noinspection JSValidateTypes
    return (
      <Tag
        text={this.props.linkedWith}
        bounded
        removable
        onRemove={this.props.onUnlink}
      />
    );
  }
  
  /**
   *
   * @param {boolean} checked
   * @private
   */
  _handleCheck(checked) {
    this.props.onCheck({ checked, id: this.props.id });
  }
  
  /**
   *
   * @private
   */
  _handleDelete() {
    this.props.onDelete({ id: this.props.id });
  }
  
  /**
   *
   * @private
   */
  _handleLink() {
    this.props.onLink({ id: this.props.id });
  }

  render() {
    let className = 'prop-item',
      wrapperClassName = 'prop-item-wrapper';
  
    className += ` ${this._getAdditionalClassNames().join(' ')}`;
    wrapperClassName += ` ${this._getAdditionalWrapperClassNames().join(' ')}`;

    let label = null;
    if (this.props.label) {
      let requireMark = null;
      if (this.props.required) {
        wrapperClassName += ' is-required';
    
        let markIcon = null;
        if (this.props.requirementFulfilled) {
          className += ' requirement-is-fulfilled';
      
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
  
    let message = null;
    if (this.props.message) {
      message = (
        <div className="prop-item_message-wrapper">
          {this.props.message}
        </div>
      );
    }
  
    let actionsLeft = null;
    if (this.props.deletable) {
      actionsLeft = (
        <div className="prop_actions prop_actions-left">
          <PropAction
            id="collapse"
            icon="times"
            onPress={this._handleDelete}
          />
        </div>
      );
    }
  
    const actionItemsRight = this._renderAdditionalActions();
  
    if (this.props.linkable) {
      const linkAction = (
        <PropAction
          key="linking"
          id="linking"
          icon="link"
          onPress={this._handleLink}
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
  
    let checkbox = null;
    if (this.props.checkable) {
      checkbox = (
        <div className="prop_subcomponent prop_subcomponent-left">
          <Checkbox
            checked={this.props.checked}
            onCheck={this._handleCheck}
          />
        </div>
      );
    }
    
    const content = this.props.linked
      ? this._renderLinked()
      : this._renderContent();
    
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
