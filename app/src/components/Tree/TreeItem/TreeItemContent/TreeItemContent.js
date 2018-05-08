import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../../utils/misc';
import { ItemContentStyled } from './styles/ItemContentStyled';
import { ItemButtonExpand } from '../ItemButton';
import { ButtonsStyled } from '../styles/ButtonsStyled';
import { IconStyled } from '../styles/IconStyled';
import { SpacerStyled } from '../styles/SpacerStyled';

import {
  TreeItemTitle,
} from '../TreeItemTitle';

const propTypes = {
  title: PropTypes.string,
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
  hasSubLevel,
  expandButtonRef,
  ...props,
}) => {
  let button = null;
  let spacer = null;

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

  return (
    <ItemContentStyled
      hovered={hovered}
      active={active}
      selected={selected}
      disabled={disabled}
      {...props}
    >
      {spacer}
      {button}
      <TreeItemTitle title={title} />
    </ItemContentStyled>
  );
};

TreeItemContent.propTypes = propTypes;
TreeItemContent.defaultProps = defaultProps;
