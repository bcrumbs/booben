'use strict';

import React from 'react';
import { Breadcrumbs } from '@reactackle/reactackle';
import './BlockBreadcrumbs.scss';

export const BlockBreadcrumbs = props => (
  <div className="block-breadcrumbs">
    <Breadcrumbs {...props} />
  </div>
);

BlockBreadcrumbs.propTypes = Breadcrumbs.propTypes;
BlockBreadcrumbs.defaultProps = Breadcrumbs.defaultProps;
BlockBreadcrumbs.displayName = 'BlockBreadcrumbs';
