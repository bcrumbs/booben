import React from 'react';
import PropTypes from 'prop-types';
import { BlockContentBoxItemStyled } from './styles/BlockContentBoxItemStyled';

const propTypes = {
  isBordered: PropTypes.bool,
  blank: PropTypes.bool,
  /* If true, block will occupy all available space */
  flexMain: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
  shading: PropTypes.oneOf(['default', 'editing', 'dim']),
  hidden: PropTypes.bool,
  hasScrollY: PropTypes.bool,
};

const defaultProps = {
  isBordered: false,
  blank: false,
  flexMain: false,
  colorScheme: 'default',
  shading: 'default',
  hidden: false,
  hasScrollY: false,
};

export const BlockContentBoxItem = props => {
  const style = {};
  if (props.hidden) style.display = 'none';

  return (
    <BlockContentBoxItemStyled
      bordered={props.isBordered}
      hasScrollY={props.hasScrollY}
      blank={props.blank}
      spread={props.flexMain}
      colorScheme={props.colorScheme}
      shading={props.shading}
      style={style}
    >
      {props.children}
    </BlockContentBoxItemStyled>
  );
};

BlockContentBoxItem.propTypes = propTypes;
BlockContentBoxItem.defaultProps = defaultProps;
BlockContentBoxItem.displayName = 'BlockContentBoxItem';
