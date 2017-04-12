'use strict';
import React, { Component, PropTypes } from 'react';
import { Breadcrumbs } from '@reactackle/reactackle';
import { BreadcrumbLink } from './BreadcrumbLink';
import './BackdropBreadcrumbs.scss';

const propTypes = {
};
const defaultProps = {
};

const breadcrumbsItems = [
  {
    title: '%sourceName%: %modal dialog title%',
    tooltipText: 'path: %path to source%'
  },
  {
    title: 'someProp: link attribute value',
    tooltipText: 'path: someProp'
  },
  {
    title: 'roles: set arguments',
    tooltipText: 'path: sources / data / getComment / user / roles '
  },
];

export const BackdropBreadcrumbs = () => {
  return (
    <div className="backdrop_breadcrumbs">
      <Breadcrumbs
        mode="light"
        items={breadcrumbsItems}
        linkComponent={BreadcrumbLink}
      />
    </div>
  )
};

BackdropBreadcrumbs.propTypes = propTypes;
BackdropBreadcrumbs.defaultProps = defaultProps;
BackdropBreadcrumbs.displayName = 'BackdropBreadcrumbs';
