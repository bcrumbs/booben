'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { CanvasPlaceholderStyled } from './styles/CanvasPlaceholderStyled';
import { ContentBoxStyled } from './styles/ContentBoxStyled';
import { TextStyled } from './styles/TextStyled';

const propTypes = {
  text: PropTypes.string,
};

const defaultProps = {
  text: '',
};

export const CanvasPlaceholder = ({ text }) => (
  <CanvasPlaceholderStyled>
    <ContentBoxStyled>
      <TextStyled>
        {text}
      </TextStyled>
    </ContentBoxStyled>
  </CanvasPlaceholderStyled>
);

CanvasPlaceholder.propTypes = propTypes;
CanvasPlaceholder.defaultProps = defaultProps;
CanvasPlaceholder.displayName = 'CanvasPlaceholder';
