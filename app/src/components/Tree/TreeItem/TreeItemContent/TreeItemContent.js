import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../../utils/misc';
import { ItemButtonExpand } from '../ItemButton';
import {
  ItemContentStyled,
  ButtonsStyled,
  IconStyled,
  SpacerStyled,
  IconSlotStyled,
  WarningStyled,
  ButtonSlotRightStyled,
} from './styles';

import {
  TreeItemTitle,
} from '../TreeItemTitle';

const propTypes = {
  title: PropTypes.string,
  warningMessage: PropTypes.string,
  iconSlot: PropTypes.element,
  buttonSlotRight: PropTypes.element,
  hasSubLevel: PropTypes.bool,
  expanded: PropTypes.bool,
  active: PropTypes.bool,
  selected: PropTypes.bool,
  hovered: PropTypes.bool,
  disabled: PropTypes.bool,
  expandButtonRef: PropTypes.func,
};

const defaultProps = {
  title: '',
  warningMessage: '',
  iconSlot: null,
  buttonSlotRight: null,
  hasSubLevel: false,
  expanded: false,
  active: false,
  selected: false,
  hovered: false,
  disabled: false,
  expandButtonRef: noop,
};

export const TreeItemContent = ({
  expanded,
  disabled,
  hovered,
  active,
  selected,
  title,
  warningMessage,
  iconSlot,
  buttonSlotRight,
  hasSubLevel,
  expandButtonRef,
  ...props,
}) => {
  let warning = null;
  let button = null;
  let spacer = null;
  let icon = null;
  let buttonSlotRightElement = null;

  if (hasSubLevel) {
    button = (
      <ButtonsStyled>
        <IconStyled innerRef={expandButtonRef}>
          <ItemButtonExpand
            disabled={disabled}
            expanded={expanded}
          />
        </IconStyled>
      </ButtonsStyled>
    );
  } else {
    spacer = <SpacerStyled />;
  }

  if (iconSlot)
    icon = <IconSlotStyled>{iconSlot}</IconSlotStyled>;

  if (warningMessage)
    warning = <WarningStyled title={warningMessage} />;

  if (buttonSlotRight)
    buttonSlotRightElement = (
      <ButtonSlotRightStyled isVisible={hovered || active}>
        {buttonSlotRight}
      </ButtonSlotRightStyled>
    );

  return (
    <ItemContentStyled
      hovered={hovered}
      active={active}
      selected={selected}
      disabled={disabled}
      {...props}
    >
      {warning}
      {spacer}
      {button}
      {icon}
      <TreeItemTitle title={title} />
      {buttonSlotRightElement}
    </ItemContentStyled>
  );
};

TreeItemContent.propTypes = propTypes;
TreeItemContent.defaultProps = defaultProps;
