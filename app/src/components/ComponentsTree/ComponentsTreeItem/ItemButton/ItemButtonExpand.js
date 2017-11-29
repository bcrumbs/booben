import React from 'react';
import { PropTypes } from 'prop-types';
import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';
import { ItemButton } from './ItemButton';

import iconExpand
  from '../../../../../assets/ic-light__chevron-right_24-bound.svg';

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
  ${transition('transform')};
  
  ${props => props.expanded && `
    transform: rotate(90deg);
  `}
  
  ${props => props.disabled && `
    opacity: 0.5;
  `}
`;

export const ItemButtonExpand = ({ expanded, disabled }) => (
  <ButtonExpand expanded={expanded} disabled={disabled}>
    <ItemButton
      icon={{
        type: 'library',
        src: iconExpand,
      }}
    />
  </ButtonExpand>
);

ItemButtonExpand.propTypes = propTypes;
ItemButtonExpand.defaultProps = defaultProps;
ItemButtonExpand.displayName = 'ItemButtonExpand';
