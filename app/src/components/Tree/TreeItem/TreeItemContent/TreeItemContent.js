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
  WarningWrapperStyled,
  ButtonSlotRightStyled,
} from './styles';

import { TreeItemTitle } from '../TreeItemTitle';

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
  hideExpandButton: PropTypes.bool,
  removeSpacer: PropTypes.bool,
  expandButtonRef: PropTypes.func,
  Tooltip: PropTypes.func,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
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
  hideExpandButton: false,
  removeSpacer: false,
  expandButtonRef: noop,
  Tooltip: null,
  showTooltip: noop,
  hideTooltip: noop,
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
  hideExpandButton,
  removeSpacer,
  ...props
}) => {
  let warning = null;
  let button = null;
  let spacer = null;
  let icon = null;
  let buttonSlotRightElement = null;
  let tooltip;

  if (hasSubLevel && !hideExpandButton) {
    button = (
      <ButtonsStyled>
        <IconStyled innerRef={expandButtonRef}>
          <ItemButtonExpand disabled={disabled} expanded={expanded} />
        </IconStyled>
      </ButtonsStyled>
    );
  } else {
    spacer = <SpacerStyled removeSpacer={removeSpacer} />;
  }

  if (iconSlot) {
    icon = <IconSlotStyled>{iconSlot}</IconSlotStyled>;
  }

  if (warningMessage) {
    warning = (
      <WarningStyled
        onMouseOut={props.hideTooltip}
        onMouseEnter={props.showTooltip}
      >
        <WarningWrapperStyled />
      </WarningStyled>
    );
  }

  if (buttonSlotRight) {
    buttonSlotRightElement = (
      <ButtonSlotRightStyled isVisible={hovered || active}>
        {buttonSlotRight}
      </ButtonSlotRightStyled>
    );
  }

  if (props.Tooltip) {
    tooltip = <props.Tooltip text={warningMessage} />;
  }

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
      {tooltip}
    </ItemContentStyled>
  );
};

TreeItemContent.propTypes = propTypes;
TreeItemContent.defaultProps = defaultProps;
