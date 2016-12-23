'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

const propTypes = {
  text: PropTypes.string,
};

const defaultProps = {
  text: '',
};

export const BlockContentPlaceholder = props => {
  let text = null;
  if (props.text) {
    text = (
      <div className="block-content-placeholder-text">
        {props.text}
      </div>
    );
  }

  return (
    <div className="block-content-placeholder">
      <div className="block-content-placeholder-content">
        {text}
        {props.children}
      </div>
    </div>
  );
};

BlockContentPlaceholder.propTypes = propTypes;
BlockContentPlaceholder.defaultProps = defaultProps;
BlockContentPlaceholder.displayName = 'BlockContentPlaceholder';
