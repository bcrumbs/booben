import React from 'react';
import PropTypes from 'prop-types';

import {
  BlockContentActionsRegionStyled,
} from './styles/BlockContentActionsRegionStyled';

const propTypes = {
  type: PropTypes.oneOf(['main', 'secondary']),
};

const defaultProps = {
  type: 'main',
};

export const BlockContentActionsRegion = props => (
  <BlockContentActionsRegionStyled type={props.type}>
    {props.children}
  </BlockContentActionsRegionStyled>
);

BlockContentActionsRegion.propTypes = propTypes;
BlockContentActionsRegion.defaultProps = defaultProps;
BlockContentActionsRegion.displayName = 'BlockContentActionsRegion';
