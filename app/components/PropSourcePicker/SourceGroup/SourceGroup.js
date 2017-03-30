'use strict';

import React, { PropTypes } from 'react';
import './SourceGroup.scss';

import { SourceGroupHeading } from './SourceGroupHeading/SourceGroupHeading';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const SourceGroup = props => (
  <div className="source-group">
    { props.title
      ? <SourceGroupHeading>{props.title}</SourceGroupHeading>
      : null
    }
    <menu className="source-list">
      {props.children}
    </menu>
  </div>
);

SourceGroup.displayName = 'SourceGroup';
SourceGroup.propTypes = propTypes;
SourceGroup.defaultProps = defaultProps;

export * from './SourceGroupItem/SourceGroupItem';
