'use strict';

import React, { PureComponent, PropTypes } from 'react';

import {
    BlockContentBoxItem,
    BlockContentBoxHeading,
} from '../../../BlockContent/BlockContent';

export const DataWindowContentGroup = props => (
  <div className="data-window_content-group">
    <div className="data-window_content-group_title">
      {props.title}
    </div>
    <div className="data-window_content-group_subtitle">
      {props.subtitle}
    </div>
    <div className="data-window_content-group_content">
      {props.children}
    </div>
  </div>
    );

DataWindowContentGroup.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

DataWindowContentGroup.defaultProps = {
  title: '',
  subtitle: '',
};

DataWindowContentGroup.displayName = 'DataWindowContentGroup';
