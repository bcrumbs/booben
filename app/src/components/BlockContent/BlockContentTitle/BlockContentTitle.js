import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactackle-button';
import { noop } from '../../../utils/misc';

import {
  BlockContentTitleAreaStyled,
} from './styles/BlockContentTitleAreaStyled';

import {
  BlockContentTitleContentStyled,
} from './styles/BlockContentTitleContentStyled';

import { SubtitleBoxStyled } from './styles/SubtitleBoxStyled';
import { TitleActionsWrapperStyled } from './styles/TitleActionsWrapperStyled';
import { TitleBoxStyled } from './styles/TitleBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { TitleIconStyled } from './styles/TitleIconStyled';

const propTypes = {
  title: PropTypes.string,
  isEditable: PropTypes.bool,
  draggable: PropTypes.bool,
  titlePlaceHolder: PropTypes.string,
  subtitle: PropTypes.string,
  iconLeft: PropTypes.element,
  buttons: PropTypes.arrayOf(PropTypes.shape(Button.propTypes)),
  colorScheme: PropTypes.oneOf(['default', 'alt']),
  onLeftIconMouseDown: PropTypes.func,
  onTitleChange: PropTypes.func,
};

const defaultProps = {
  title: '',
  isEditable: false,
  draggable: false,
  titlePlaceHolder: '',
  subtitle: null,
  iconLeft: null,
  buttons: [],
  colorScheme: 'default',
  onLeftIconMouseDown: noop,
  onTitleChange: noop,
};

export class BlockContentTitle extends PureComponent {
  constructor(...args) {
    super(...args);

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
    const {
      iconLeft,
      buttons,
      isEditable,
      title,
      subtitle,
      colorScheme,
      draggable,
      titlePlaceHolder,
      onLeftIconMouseDown,
      component,
    } = this.props;

    const { editingTitle } = this.state;

    const iconLeftElement = iconLeft
      ? (
        <TitleIconStyled
          colorScheme={colorScheme}
          onMouseDown={onLeftIconMouseDown}
        >
          {iconLeft}
        </TitleIconStyled>
      )
      : null;

    let buttonsArea = null;
    if (buttons.length > 0) {
      /* eslint-disable react/jsx-handler-names */
      const buttonElements = buttons.map((button, idx) => (
        <Button
          key={String(idx)}
          {...button}
        />
      ));
      /* eslint-enable react/jsx-handler-names */

      buttonsArea = (
        <TitleActionsWrapperStyled>
          {buttonElements}
        </TitleActionsWrapperStyled>
      );
    }

    const disabled = !isEditable ? 'disabled' : '';
    const titleElement = (
      <TitleBoxStyled editable={isEditable}>
        <TitleStyled
          colorScheme={colorScheme}
          disabled={disabled}
          editable={isEditable}
          editing={editingTitle}
          value={title}
          title={title}
          placeholder={titlePlaceHolder}
          onChange={this._handleTitleChange}
          onFocus={this._handleTitleInputFocus}
          onBlur={this._handleTitleInputBlur}
        />
      </TitleBoxStyled>
    );

    let subtitleElement = null;
    if (subtitle) {
      subtitleElement = (
        <SubtitleBoxStyled colorScheme={colorScheme} title={subtitle}>
          <span>{subtitle}</span>
        </SubtitleBoxStyled>
      );
    }

    return (
      <BlockContentTitleAreaStyled draggable={draggable}>
        {iconLeftElement}

        <BlockContentTitleContentStyled>
          {!component && titleElement}
          {subtitleElement}
          {component}
        </BlockContentTitleContentStyled>

        {buttonsArea}
      </BlockContentTitleAreaStyled>
    );
  }
}

BlockContentTitle.propTypes = propTypes;
BlockContentTitle.defaultProps = defaultProps;
BlockContentTitle.displayName = 'BlockContentTitle';
