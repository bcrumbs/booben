'use strict';

import './ComponentTag.scss';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { noop } from '../../utils/misc';

export const ComponentTag = props => {
  let className = 'component-tag-box';
  if (props.focused) className += ' is-focused';

  return (
    <div
      className={className}
      onMouseDown={props.onStartDrag}
    >
      <div className="component-tag">
        <picture className="component-tag-image">
          <img src={props.image} />
        </picture>

        <div className="component-tag-title-box">
          <div className="component-tag-title">
            {props.title}
          </div>
        </div>
      </div>
    </div>
  );
};

ComponentTag.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  focused: PropTypes.bool,

  onStartDrag: PropTypes.func,
};

ComponentTag.defaultProps = {
  image: '',
  title: '',
  focused: false,

  onStartDrag: noop,
};

ComponentTag.displayName = 'ComponentTag';

export * from './ComponentTagWrapper/ComponentTagWrapper';
