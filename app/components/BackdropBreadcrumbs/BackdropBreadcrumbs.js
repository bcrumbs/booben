'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumbs } from '@reactackle/reactackle';
import { BreadcrumbLink } from './BreadcrumbLink';
import './BackdropBreadcrumbs.scss';

const propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    tooltipText: PropTypes.string,
  })),
};
const defaultProps = {
  items: [],
};

export const BackdropBreadcrumbs = props => (
  <div className="backdrop_breadcrumbs">
    <Breadcrumbs
      mode="light"
      items={props.items}
      linkComponent={BreadcrumbLink}
    />
  </div>
);

BackdropBreadcrumbs.propTypes = propTypes;
BackdropBreadcrumbs.defaultProps = defaultProps;
BackdropBreadcrumbs.displayName = 'BackdropBreadcrumbs';
