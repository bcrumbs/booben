import React from 'react';
import PropTypes from 'prop-types';

import {
  BlockContentPlaceholderStyled,
} from './styles/BlockContentPlaceholderStyled';

import {
  BlockContentPlaceholderContentStyled,
} from './styles/BlockContentPlaceholderContentStyled';

import {
  BlockContentPlaceholderTextStyled,
} from './styles/BlockContentPlaceholderTextStyled';

const propTypes = {
  text: PropTypes.string,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  text: '',
  colorScheme: 'default',
};

export const BlockContentPlaceholder = props => {
  const text = props.text && (
    <BlockContentPlaceholderTextStyled colorScheme={props.colorScheme}>
      {props.text}
    </BlockContentPlaceholderTextStyled>
  );

  return (
    <BlockContentPlaceholderStyled>
      <BlockContentPlaceholderContentStyled colorScheme={props.colorScheme}>
        {text}
        {props.children}
      </BlockContentPlaceholderContentStyled>
    </BlockContentPlaceholderStyled>
  );
};

BlockContentPlaceholder.propTypes = propTypes;
BlockContentPlaceholder.defaultProps = defaultProps;
BlockContentPlaceholder.displayName = 'BlockContentPlaceholder';
