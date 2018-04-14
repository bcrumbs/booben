import React from 'react';
import PropTypes from 'prop-types';
import { ArtboardExpanderStyled } from './styles/ArtboardExpanderStyled';
import { IconStyled } from './styles/IconStyled';

const propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical', 'entire']),
};

const defaultProps = {
  position: 'horizontal',
};

export const ArtboardExpander = props => (
  <ArtboardExpanderStyled position={props.position}>
    <IconStyled position={props.position} />
  </ArtboardExpanderStyled>
);

ArtboardExpander.propTypes = propTypes;
ArtboardExpander.defaultProps = defaultProps;
ArtboardExpander.displayName = 'ArtboardExpander';
