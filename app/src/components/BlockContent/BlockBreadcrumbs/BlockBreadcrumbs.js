'use strict';

import React from 'react';
import { Breadcrumbs } from '@reactackle/reactackle';
import './BlockBreadcrumbs.scss';

/* eslint-disable react/prop-types */
const LinkComponent = ({ onClick, children }) => (
  <a style={{ cursor: 'pointer' }} onClick={onClick}>
    {children}
  </a>
);
/* eslint-enable react/prop-types */

export const BlockBreadcrumbs = props => (
  <div className="block-breadcrumbs">
    <Breadcrumbs
      {...props}
      linkComponent={LinkComponent}
    />
  </div>
);

BlockBreadcrumbs.propTypes = Breadcrumbs.propTypes;
BlockBreadcrumbs.defaultProps = Breadcrumbs.defaultProps;
BlockBreadcrumbs.displayName = 'BlockBreadcrumbs';
