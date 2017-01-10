'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { noop } from '../../utils/misc';
import './ComponentTag.scss';

const propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  focused: PropTypes.bool,
  onStartDrag: PropTypes.func,
};

const defaultProps = {
  image: '',
  title: '',
  focused: false,
  onStartDrag: noop,
};

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
          <img src={props.image} alt="" role="presentation" />
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

ComponentTag.propTypes = propTypes;
ComponentTag.defaultProps = defaultProps;
ComponentTag.displayName = 'ComponentTag';

export * from './ComponentTagWrapper/ComponentTagWrapper';
