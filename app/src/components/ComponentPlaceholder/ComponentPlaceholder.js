'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils/misc';
import { TitleStyled } from './styles/TitleStyled';

import {
  ComponentPlaceholderStyled,
} from './styles/ComponentPlaceholderStyled';

const propTypes = {
  title: PropTypes.string,
  isPlaced: PropTypes.bool,
  isInvisible: PropTypes.bool,
  elementRef: PropTypes.func,
};

const defaultProps = {
  title: '',
  isPlaced: false,
  isInvisible: false,
  elementRef: noop,
};

export const ComponentPlaceholder = props => {
  let content = false;
  if (props.title) {
    content = (
      <TitleStyled className='js-component-placeholder-title'>
        {props.title}
      </TitleStyled>
    );
  }

  return (
    <ComponentPlaceholderStyled
      placed={props.isPlaced}
      visible={!props.isInvisible}
      ref={props.elementRef}
    >
      {content}
    </ComponentPlaceholderStyled>
  );
};

ComponentPlaceholder.propTypes = propTypes;
ComponentPlaceholder.defaultProps = defaultProps;
ComponentPlaceholder.displayName = 'ComponentPlaceholder';
