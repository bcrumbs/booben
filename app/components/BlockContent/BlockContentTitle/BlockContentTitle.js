'use strict';

// noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {
    Icon,
    Button,
} from '@reactackle/reactackle';

import { List } from 'immutable';

import ButtonType from '../../../models/Button';

import { noop } from '../../../utils/misc';

export class BlockContentTitle extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editingTitle: false,
    };

    this._handleTitleInputFocus = this._handleTitleInputFocus.bind(this);
    this._handleTitleInputBlur = this._handleTitleInputBlur.bind(this);
    this._handleTitleChange = this._handleTitleChange.bind(this);
  }

  _handleTitleInputFocus() {
    this.setState({
      editingTitle: true,
    });
  }

  _handleTitleInputBlur() {
    this.setState({
      editingTitle: false,
    });
  }

  _handleTitleChange(event) {
    this.props.onTitleChange(event.target.value);
  }

  render() {
    const prefix = 'block-content';

    let titleClassName = `${prefix}-title-box`;
    if (this.props.isEditable) titleClassName += ' is-editable';
    if (this.state.editingTitle) titleClassName += ' editing-is-on';

    let iconLeft = null;
    if (this.props.iconLeft) {
      iconLeft = (
        <div
          className={`${prefix}-icon ${prefix}-icon-left`}
          onMouseDown={this.props.onLeftIconMouseDown}
        >
          <Icon name={this.props.iconLeft} />
        </div>
            );
    }


    let buttonsArea = null;
    if (this.props.buttons.size > 0) {
      const buttons = this.props.buttons.map((button, idx) => (
        <Button
          key={idx}
          icon={button.icon}
          disabled={button.disabled}
          onPress={button.onPress}
        />
            ));

      buttonsArea = (
        <div className={`${prefix}-title-actions-wrapper`}>
          {buttons}
        </div>
            );
    }

    const disabled = !this.props.isEditable ? 'disabled' : '';
    const title = (
      <div className={titleClassName}>
        <input
          className={`${prefix}-title`}
          value={this.props.title}
          disabled={disabled}
          placeholder={this.props.titlePlaceHolder}
          onChange={this._handleTitleChange}
          onFocus={this._handleTitleInputFocus}
          onBlur={this._handleTitleInputBlur}
        />
      </div>
        );

    let subtitle = null;
    if (this.props.subtitle) {
      subtitle = (
        <div className={`${prefix}-subtitle-box`}>
          <span className={`${prefix}-subtitle`}>
            {this.props.subtitle}
          </span>
        </div>
            );
    }

    return (
      <div className={`${prefix}-title-area`}>
        {iconLeft}

        <div className={`${prefix}-title-content`}>
          {title}
          {subtitle}
        </div>

        {buttonsArea}
      </div>
    );
  }
}

BlockContentTitle.propTypes = {
  title: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  titlePlaceHolder: PropTypes.string,
  subtitle: PropTypes.string,
  iconLeft: PropTypes.string,
  buttons: ImmutablePropTypes.listOf(
        PropTypes.instanceOf(ButtonType),
    ),
  onLeftIconMouseDown: PropTypes.func,
  onTitleChange: PropTypes.func,
};

BlockContentTitle.defaultProps = {
  title: '',
  isEditable: false,
  titlePlaceHolder: '',
  subtitle: null,
  iconLeft: null,
  buttons: List(),
  onLeftIconMouseDown: noop,
  onTitleChange: noop,
};

BlockContentTitle.displayName = 'BlockContentTitle';
