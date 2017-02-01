'use strict';

import React from 'react';
import './ComponentBreadcrumbs.scss';

export const ComponentBreadcrumbs = ({ children }) => (
  <div className="component-breadcrumbs">
    {children}
  </div>
);

ComponentBreadcrumbs.displayName = 'ComponentBreadcrumbs';

export * from './ComponentBreadcrumbItem/ComponentBreadcrumbItem';
