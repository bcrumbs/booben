'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
};

const defaultProps = {
  title: '',
  message: '',
};

export const ErrorScreen = props => (
  <div className="state-screen state-screen_error">
    <div className="state-screen_content">
      <div className="state-screen_title">
        {props.title}
      </div>
      <div className="state-screen_message">
        {props.message}
      </div>
    </div>
  </div>
);

ErrorScreen.propTypes = propTypes;
ErrorScreen.defaultProps = defaultProps;
ErrorScreen.displayName = 'ErrorScreen';
