import React from 'react';
import PropTypes from 'prop-types';
import { ItemButtonExpand } from './RouteTreeItemButtonExpand';
import { RouteTreeItemButton } from './RouteTreeItemButton';
import { RouteTreeItemIcon } from './RouteTreeItemIcon';
import { RouteTreeItemTitle } from './RouteTreeItemTitle';
import { SpacerStyled, ItemContentStyled } from './styles';

const propTypes = {
  title: PropTypes.string,
  hasSubLevel: PropTypes.bool,
  expanded: PropTypes.bool,
  active: PropTypes.bool,
  selected: PropTypes.bool,
  hovered: PropTypes.bool,
  disabled: PropTypes.bool,
};

const defaultProps = {
  title: '',
  hasSubLevel: false,
  expanded: false,
  active: false,
  selected: false,
  hovered: false,
  disabled: false,
};

export const RouteTreeItemContent = props => {
  const { expanded, title, hasSubLevel } = props;
  let button = null;
  let spacer = null;

  if (hasSubLevel) {
    button = (
      <RouteTreeItemButton>
        <RouteTreeItemIcon>
          <ItemButtonExpand
            disabled={props.disabled}
            expanded={expanded}
          />
        </RouteTreeItemIcon>
      </RouteTreeItemButton>
    );
  } else {
    spacer = <SpacerStyled />;
  }

  return (
    <ItemContentStyled
      hovered={props.hovered}
      active={props.active}
      selected={props.selected}
      disabled={props.disabled}
    >
      {spacer}
      {button}
      <RouteTreeItemTitle title={title} />
    </ItemContentStyled>
  );
}


RouteTreeItemContent.propTypes = propTypes;
RouteTreeItemContent.defaultProps = defaultProps;
