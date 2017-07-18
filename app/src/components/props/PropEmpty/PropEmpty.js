/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import { PropBase } from '../PropBase/PropBase';

export const PropEmpty = props => (
  <PropBase {...props} content={null} />
);

PropEmpty.propTypes = PropBase.propTypes;
PropEmpty.defaultProps = PropBase.defaultProps;
PropEmpty.displayName = 'PropEmpty';
