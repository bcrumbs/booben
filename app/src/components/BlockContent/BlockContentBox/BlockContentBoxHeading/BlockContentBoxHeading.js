import React from 'react';
import PropTypes from 'prop-types';

import {
  BlockContentBoxHeadingStyled,
} from './styles/BlockContentBoxHeadingStyled';

const propTypes = {
  isBordered: PropTypes.bool,
  removePaddingX: PropTypes.bool,
  hidden: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  isBordered: false,
  removePaddingX: false,
  hidden: false,
  colorScheme: 'default',
};

export const BlockContentBoxHeading = props => {
  const style = {};
  if (props.hidden) style.display = 'none';

  return (
    <BlockContentBoxHeadingStyled
      colorScheme={props.colorScheme}
      bordered={props.isBordered}
      removePaddingX={props.removePaddingX}
      style={style}
    >
      {props.children}
    </BlockContentBoxHeadingStyled>
  );
};

BlockContentBoxHeading.propTypes = propTypes;
BlockContentBoxHeading.defaultProps = defaultProps;
BlockContentBoxHeading.displayName = 'BlockContentBoxHeading';
