/**
 * @author Dmitriy Bizyaev
 */

'use strict';

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
    <IconStyled />
  </ArtboardExpanderStyled>
);

ArtboardExpander.propTypes = propTypes;
ArtboardExpander.defaultProps = defaultProps;
ArtboardExpander.displayName = 'ArtboardExpander';
