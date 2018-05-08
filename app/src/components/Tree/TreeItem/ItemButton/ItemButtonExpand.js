import React from 'react';
import { PropTypes } from 'prop-types';
import { ItemButton } from './ItemButton';
import { IconArrowChevronRight } from '../../../icons';
import { ButtonExpandStyled } from './styles';

const propTypes = {
  expanded: PropTypes.bool,
  disabled: PropTypes.bool,
};

const defaultProps = {
  expanded: false,
  disabled: false,
};

export const ItemButtonExpand = ({ expanded, disabled }) => (
  <ButtonExpandStyled expanded={expanded} disabled={disabled}>
    <ItemButton
      icon={<IconArrowChevronRight size="custom" color="currentColor" />}
    />
  </ButtonExpandStyled>
);

ItemButtonExpand.propTypes = propTypes;
ItemButtonExpand.defaultProps = defaultProps;
