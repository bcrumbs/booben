/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon, Checkbox, Tag } from '@reactackle/reactackle';
import { PropLabel } from './PropLabel/PropLabel';
import { PropImage } from './PropImage/PropImage';
import { PropAction } from './PropAction/PropAction';
import { noop } from '../../../utils/misc';

const ActionPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired,
});

const propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  secondaryLabel: PropTypes.string,
  image: PropTypes.string,
  tooltip: PropTypes.string,
  message: PropTypes.string,
  linkable: PropTypes.bool,
  pickable: PropTypes.bool,
  linked: PropTypes.bool,
  linkedWith: PropTypes.string,
  required: PropTypes.bool,
  requirementFulfilled: PropTypes.bool,
  checkable: PropTypes.bool,
  checked: PropTypes.bool,
  deletable: PropTypes.bool,
  additionalActions: PropTypes.arrayOf(ActionPropType),
  onLink: PropTypes.func,
  onPick: PropTypes.func,
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
  pickable: false,
  linked: false,
  linkedWith: '',
  required: false,
  requirementFulfilled: false,
  checkable: false,
  checked: false,
  deletable: false,
  additionalActions: [],
  onLink: noop,
  onPick: noop,
  onUnlink: noop,
  onCheck: noop,
  onDelete: noop,
};

export class PropBase extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this._handleCheck = this._handleCheck.bind(this);
    this._handleDelete = this._handleDelete.bind(this);
    this._handleLink = this._handleLink.bind(this);
    this._handlePick = this._handlePick.bind(this);
  }
  
  /**
   * To be overridden in subclasses
   *
   * @return {string[]}
   * @private
   */
  _getAdditionalClassNames() {
    return [];
  }

  /**
   * To be overridden in subclasses
   *
   * @return {string[]}
   * @private
   */
  _getAdditionalWrapperClassNames() {
    return [];
  }

  /**
   * To be overridden in subclasses
   *
   * @return {ReactElement[]}
   * @private
   */
  _renderAdditionalActions() {
    return [];
  }

  /**
   * Must be overridden in subclasses
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
    const { linkedWith, onUnlink } = this.props;

    //noinspection JSValidateTypes
    return (
      <Tag
        text={linkedWith}
        bounded
        removable
        onRemove={onUnlink}
      />
    );
  }
  
  /**
   *
   * @param {boolean} value
   * @private
   */
  _handleCheck({ value }) {
    const { id, onCheck } = this.props;
    onCheck({ checked: value, id });
  }
  
  /**
   *
   * @private
   */
  _handleDelete() {
    const { id, onDelete } = this.props;
    onDelete({ id });
  }
  
  /**
   *
   * @private
   */
  _handleLink() {
    const { id, onLink } = this.props;
    onLink({ id });
  }

  /**
   *
   * @private
   */
  _handlePick() {
    const { id, onPick } = this.props;
    onPick({ id });
  }

  render() {
    const {
      label,
      secondaryLabel,
      image,
      tooltip,
      message,
      required,
      requirementFulfilled,
      deletable,
      linkable,
      linked,
      pickable,
      checkable,
      checked,
      additionalActions,
      children,
    } = this.props;

    let className = 'prop-item';
    let wrapperClassName = 'prop-item-wrapper';
  
    className += ` ${this._getAdditionalClassNames().join(' ')}`;
    wrapperClassName += ` ${this._getAdditionalWrapperClassNames().join(' ')}`;

    let labelElement = null;
    if (label) {
      let requireMark = null;
      if (required) {
        wrapperClassName += ' is-required';
    
        let markIcon = null;
        if (requirementFulfilled) {
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
      
      labelElement = (
        <div className="prop-item_label-box">
          {requireMark}
        
          <PropLabel
            label={label}
            secondaryLabel={secondaryLabel}
            tooltip={tooltip}
          />
        </div>
      );
    }
  
    let imageElement = null;
    if (image) {
      imageElement = (
        <PropImage src={image} />
      );
    
      wrapperClassName += ' has-image';
    }
  
    let messageElement = null;
    if (message) {
      messageElement = (
        <div className="prop-item_message-wrapper">
          {message}
        </div>
      );
    }
  
    let actionsLeftElement = null;
    if (deletable) {
      actionsLeftElement = (
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
  
    if (linkable && (!checkable || checked)) {
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

    if (pickable && (!checkable || checked)) {
      const pickAction = (
        <PropAction
          key="pick"
          id="pick"
          icon="eyedropper"
          onPress={this._handlePick}
        />
      );

      actionItemsRight.push(pickAction);
    }

    additionalActions.forEach(action => {
      /* eslint-disable react/jsx-handler-names */
      actionItemsRight.push(
        <PropAction
          key={action.id}
          id={action.id}
          icon={action.icon}
          onPress={action.handler}
        />,
      );
      /* eslint-disable react/jsx-handler-names */
    });
  
    let actionsRightElement = null;
    if (actionItemsRight.length) {
      actionsRightElement = (
        <div className="prop_actions prop_actions-right">
          {actionItemsRight}
        </div>
      );
    }
  
    let checkboxElement = null;
    if (checkable) {
      checkboxElement = (
        <div className="prop_subcomponent prop_subcomponent-left">
          <Checkbox
            checked={checked}
            onChange={this._handleCheck}
          />
        </div>
      );
    }
    
    const content = linked ? this._renderLinked() : this._renderContent();
    
    return (
      <div className={className}>
        <div className={wrapperClassName}>
          {checkboxElement}
          {actionsLeftElement}
          {imageElement}
        
          <div className="prop-item-content-box">
            {labelElement}
            
            <div className="prop-item_value-wrapper">
              {messageElement}
            </div>
          
            <div className="prop-item_value-wrapper">
              {content}
            </div>
          </div>
        
          {actionsRightElement}
        </div>
      
        {children}
      </div>
    );
  }
}

PropBase.propTypes = propTypes;
PropBase.defaultProps = defaultProps;
PropBase.displayName = 'PropBase';
