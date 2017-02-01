'use strict';

import React, { Component, PropTypes } from 'react';
import './StateScreen.scss';

const ErrorScreen = (props) => (
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

StateScreen.propTypes = propTypes;
StateScreen.defaultProps = defaultProps;
StateScreen.displayName = 'StateScreen';

