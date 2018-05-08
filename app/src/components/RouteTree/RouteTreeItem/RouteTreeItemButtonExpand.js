import React from 'react';
import { PropTypes } from 'prop-types';
import styled from 'styled-components';
import { Button } from 'reactackle-button';
import { RouteTreeItemButton } from './RouteTreeItemButton';
import { IconArrowChevronRight } from '../../icons';

const propTypes = {
  expanded: PropTypes.bool,
  disabled: PropTypes.bool,
};

const defaultProps = {
  expanded: false,
  disabled: false,
};

const ButtonExpand = styled.div`
  display: flex;
  
  ${props => props.expanded && `
    transform: rotate(90deg);
  `}
  
  ${props => props.disabled && `
    opacity: 0.5;
  `}
`;

export const ItemButtonExpand = ({ expanded, disabled }) => (
  <ButtonExpand expanded={expanded} disabled={disabled}>
    <RouteTreeItemButton>
      <Button
        size="small"
        radius="rounded"
        icon={
          <IconArrowChevronRight size="custom" color="currentColor" />
        }
      />
    </RouteTreeItemButton>
  </ButtonExpand>
);

ItemButtonExpand.propTypes = propTypes;
ItemButtonExpand.defaultProps = defaultProps;
ItemButtonExpand.displayName = 'ItemButtonExpand';
