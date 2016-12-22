'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Icon } from '@reactackle/reactackle';

const propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
};

const defaultProps = {
  icon: '',
};

export const BlockContentShortcut = props => {
  let className = 'block-content-shortcut',
    icon = null,
    text = null;

  if (props.icon) {
    icon = (
      <Icon name={props.icon} />
    );
  } else {
    className += ' shortcut-without-icon';

    text = (
      <span className="shortcut-text">
        {props.title}
      </span>
    );
  }

  return (
    <div className={className}>
      {icon}
      {text}
    </div>
  );
};

BlockContentShortcut.propTypes = propTypes;
BlockContentShortcut.defaultProps = defaultProps;
BlockContentShortcut.displayName = 'BlockContentShortcut';
