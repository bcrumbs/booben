'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, TooltipIcon } from '@reactackle/reactackle';
import { noop, returnArg } from '../../../utils/misc';

const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  type: PropTypes.string,
  tooltip: PropTypes.string,
  data: PropTypes.any,
  actionType: PropTypes.oneOf(['jump', 'select']),
  argsButton: PropTypes.bool,
  selected: PropTypes.bool,
  state: PropTypes.oneOf(['error', 'success']),
  connection: PropTypes.bool,
  canBeApplied: PropTypes.bool,
  getLocalizedText: PropTypes.func,
  onSelect: PropTypes.func,
  onSetArgumentsClick: PropTypes.func,
  onApplyClick: PropTypes.func,
  onJumpIntoClick: PropTypes.func,
};

const defaultProps = {
  description: '',
  type: '',
  tooltip: '',
  data: null,
  actionType: 'select',
  argsButton: false,
  selected: false,
  state: null,
  connection: false,
  canBeApplied: false,
  getLocalizedText: returnArg,
  onSelect: noop,
  onSetArgumentsClick: noop,
  onApplyClick: noop,
  onJumpIntoClick: noop,
};

export class DataItem extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._handleSelect = this._handleSelect.bind(this);
    this._handleJumpInto = this._handleJumpInto.bind(this);
    this._handleApplyClick = this._handleApplyClick.bind(this);
    this._handleSetArgumentsClick = this._handleSetArgumentsClick.bind(this);
  }
  
  _handleSelect() {
    const { id, data, onSelect } = this.props;
    onSelect({ id, data });
  }
  
  _handleJumpInto() {
    const { id, data, onJumpIntoClick } = this.props;
    onJumpIntoClick({ id, data });
  }
  
  _handleApplyClick() {
    const { id, data, onApplyClick } = this.props;
    onApplyClick({ id, data });
  }
  
  _handleSetArgumentsClick() {
    const { id, data, onSetArgumentsClick } = this.props;
    onSetArgumentsClick({ id, data });
  }
  
  render() {
    const {
      title,
      description,
      tooltip,
      selected,
      state,
      actionType,
      argsButton,
      connection,
      canBeApplied,
      type,
      getLocalizedText,
    } = this.props;
    
    let className = 'data-list-item';
    if (selected) className += ' is-chosen';
    if (state) className += ` state-${state}`;
    if (actionType) className += ` action-type-${actionType}`;
  
    let tooltipElement = null;
    if (tooltip) {
      tooltipElement = (
        <TooltipIcon text={tooltip} />
      );
    }
  
    let argsButtonElement = null;
    if (argsButton) {
      argsButtonElement = (
        <Button
          narrow
          text={getLocalizedText('linkDialog.data.setArguments')}
          onPress={this._handleSetArgumentsClick}
        />
      );
    }
  
    let actionsRight = null;
    if (connection) {
      actionsRight = (
        <div className="data-item_actions data-item_actions-right">
          <div className="data-item_actions data-item_actions-right">
            <Button
              icon={{ name: 'chevron-right' }}
              onPress={this._handleJumpInto}
            />
          </div>
        </div>
      );
    }
  
    let descriptionElement = null;
    if (description) {
      descriptionElement = (
        <div className="data-item_description">
          {description}
        </div>
      );
    }
  
    let content = null;
    if (descriptionElement || argsButtonElement || canBeApplied) {
      let applyButton = null;
      if (canBeApplied) {
        applyButton = (
          <Button
            narrow
            text={getLocalizedText('common.apply')}
            onPress={this._handleApplyClick}
          />
        );
      }
    
      content = (
        <div className="data-item_content">
          {descriptionElement}
          <div className="data-item_buttons">
            {argsButtonElement}
            {applyButton}
          </div>
        </div>
      );
    }
  
    let typeElement = null;
    if (type) {
      typeElement = (
        <span className="data-item_type">{type}</span>
      );
    }
  
    return (
      <div className={className} onClick={this._handleSelect}>
        <div className="data-item_content-box">
          <div className="data-item_title-box">
            <div className="data-item_title">
              <span className="data-item_title-text">{title}</span>
              {typeElement}
              {tooltipElement}
            </div>
          </div>
          {content}
        </div>
        {actionsRight}
      </div>
    );
  }
}

DataItem.propTypes = propTypes;
DataItem.defaultProps = defaultProps;
DataItem.displayName = 'DataItem';
