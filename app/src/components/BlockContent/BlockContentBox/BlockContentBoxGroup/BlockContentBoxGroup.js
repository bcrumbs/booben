import React from 'react';
import PropTypes from 'prop-types';

import {
  BlockContentBoxGroupStyled,
} from './styles/BlockContentBoxGroupStyled';

const propTypes = {
  shading: PropTypes.oneOf(['default', 'editing', 'dim']),
  colorScheme: PropTypes.oneOf(['default', 'alt']),
  isBordered: PropTypes.bool,
};

const defaultProps = {
  shading: 'default',
  colorScheme: 'default',
  isBordered: false,
};

export const BlockContentBoxGroup = props => (
  <BlockContentBoxGroupStyled
    colorScheme={props.colorScheme}
    shading={props.shading}
    bordered={props.isBordered}
  >
    {props.children}
  </BlockContentBoxGroupStyled>
);

BlockContentBoxGroup.propTypes = propTypes;
BlockContentBoxGroup.defaultProps = defaultProps;
BlockContentBoxGroup.displayName = 'BlockContentBoxGroup';
