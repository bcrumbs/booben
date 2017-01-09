'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';

import {
    Button,
    TooltipIcon,
} from '@reactackle/reactackle';

import { noop, returnArg } from '../../../utils/misc';

export class DataItem extends PureComponent {
  constructor(props) {
    super(props);
    
    this._handleSelect = this._handleSelect.bind(this);
  }
  
  _handleSelect() {
    this.props.onSelect({ id: this.props.id });
  }
  
  render() {
    let className = 'data-list-item';
    if (this.props.chosen) className += ' is-chosen';
    if (this.props.state) className += ` state-${this.props.state}`;
    
    if (this.props.actionType)
      className += ` action-type-${this.props.actionType}`;
  
    let tooltip = null,
      content = null,
      description = null,
      argsButton = null,
      actionsRight = null;
  
    if (this.props.tooltip) {
      tooltip = (
        <TooltipIcon text={this.props.tooltip} />
      );
    }
  
    if (this.props.argsButton) {
      argsButton = (
        <Button
          onPress={this.props.onSetArgumentsClick}
          text={this.props.getLocalizedText('setArguments')}
          narrow
        />
      );
    }
  
    if (this.props.connection) {
      actionsRight = (
        <div className="data-item_actions data-item_actions-right">
          <div className="data-item_actions data-item_actions-right">
            <Button
              icon="chevron-right"
              onPress={this.props.onJumpIntoClick}
            />
          </div>
        </div>
      );
    }
  
    if (this.props.description) {
      description = (
        <div className="data-item_description">
          {this.props.description}
        </div>
      );
    }
  
    if (description || argsButton || this.props.canBeApplied) {
      let applyButton = null;
      if (this.props.canBeApplied) {
        applyButton = (
          <Button
            text={this.props.getLocalizedText('apply')}
            onPress={this.props.onApplyClick}
            narrow
          />
        );
      }
    
      content = (
        <div className="data-item_content">
          {description}
          <div className="data-item_buttons">
            {argsButton}
            {applyButton}
          </div>
        </div>
      );
    }
  
    let type = null;
    if (this.props.type) {
      type = (
        <span className="data-item_type">{this.props.type}</span>
      );
    }
  
    return (
      <div className={className} onClick={this._handleSelect}>
        <div className="data-item_content-box">
          <div className="data-item_title-box">
            <div className="data-item_title">
              <span className="data-item_title-text">{this.props.title}</span>
              {type}
              {tooltip}
            </div>
          </div>
          {content}
        </div>
        {actionsRight}
      </div>
    );
  }
}

DataItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  type: PropTypes.string,
  tooltip: PropTypes.string,
  actionType: PropTypes.oneOf(['jump', 'select']),
  argsButton: PropTypes.bool,
  chosen: PropTypes.bool,
  state: PropTypes.oneOf(['error', 'success']),
  connection: PropTypes.bool,
  canBeApplied: PropTypes.bool,
  getLocalizedText: PropTypes.func,

  onSelect: PropTypes.func,
  onSetArgumentsClick: PropTypes.func,
  onApplyClick: PropTypes.func,
  onJumpIntoClick: PropTypes.func,
};

DataItem.defaultProps = {
  description: '',
  type: '',
  tooltip: '',
  actionType: 'select',
  argsButton: false,
  chosen: false,
  state: null,
  connection: false,
  canBeApplied: false,
  getLocalizedText: returnArg,

  onSelect: noop,
  onSetArgumentsClick: noop,
  onApplyClick: noop,
  onJumpIntoClick: noop,
};

DataItem.displayName = 'DataItem';
