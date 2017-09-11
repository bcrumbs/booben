import React from 'react';
import { PropTypes } from 'prop-types';
import styled from 'styled-components';
import { transition } from '@reactackle/reactackle';
import { ItemButton } from './ItemButton';

import ICON_EXPAND
  from '../../../../../assets/ic-light__chevron-right_24-bound.svg';

const propTypes = {
  expanded: PropTypes.bool,
};

const defaultProps = {
  expanded: false,
};

const ButtonExpand = styled.div`
  display: flex;
  ${transition('transform')};
  
  ${props => props.expanded && `
    transform: rotate(90deg);
  `}
`;

export const ItemButtonExpand = ({ expanded }) => (
  <ButtonExpand expanded={expanded}>
    <ItemButton
      icon={{
        type: 'library',
        src: ICON_EXPAND,
      }}
    />
  </ButtonExpand>
);

ItemButtonExpand.propTypes = propTypes;
ItemButtonExpand.defaultProps = defaultProps;
ItemButtonExpand.displayName = 'ItemButtonExpand';
