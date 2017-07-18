'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { StateScreenStyled } from '../styles/StateScreenStyled';
import { ContentStyled } from '../styles/ContentStyled';
import { TitleStyled } from '../styles/TitleStyled';
import { MessageStyled } from '../styles/MessageStyled';
import backgroundImage from '../../../../assets/error.gif';

const propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
};

const defaultProps = {
  title: '',
  message: '',
};

export const ErrorScreen = props => (
  <StateScreenStyled
    image={backgroundImage}
    overlayColor="rgba(51, 58, 69, 0.95)"
  >
    <ContentStyled>
      <TitleStyled light>
        {props.title}
      </TitleStyled>
      <MessageStyled light>
        {props.message}
      </MessageStyled>
    </ContentStyled>
  </StateScreenStyled>
);

ErrorScreen.propTypes = propTypes;
ErrorScreen.defaultProps = defaultProps;
ErrorScreen.displayName = 'ErrorScreen';
