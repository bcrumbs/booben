import React from 'react';
import PropTypes from 'prop-types';

import {
  DraggableWindowRegionStyled,
} from './styles/DraggableWindowRegionStyled';

const propTypes = {
  type: PropTypes.oneOf(['main', 'aside']),
};

const defaultProps = {
  type: 'main',
};

export const DraggableWindowRegion = props => (
  <DraggableWindowRegionStyled type={props.type}>
    {props.children}
  </DraggableWindowRegionStyled>
);

DraggableWindowRegion.propTypes = propTypes;
DraggableWindowRegion.defaultProps = defaultProps;
DraggableWindowRegion.displayName = 'DraggableWindowRegion';
